// Aturan bisnis transaksi peminjaman (PRD bab 4.6 sampai 4.9 dan bab 5).
// Semua fungsi yang mengubah stok berjalan dalam transaksi database dengan penguncian baris.
import { query, withTransaction, BusinessError } from "@/lib/db";
import { BORROWER_ROLES, CONFIG, LOAN_STATUS } from "@/lib/config";
import { rupiah } from "@/lib/format";
import { notify } from "@/lib/notify";
import { promoteReservations } from "@/lib/services/reservations";
import { getBorrowerStatus } from "@/lib/services/borrower";

export { getBorrowerStatus };

const ACTIVE = `('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan')`;
const BORROWED = `('Sedang Dipinjam','Perpanjangan Diajukan')`;

// Status tombol "Ajukan Pinjam" pada halaman detail buku (Diagram 21)
export async function getLoanButtonState(user, book) {
  if (!user) return { state: "guest" };
  if (!BORROWER_ROLES.includes(user.role)) return { state: "staff" };
  const st = await getBorrowerStatus(user.id);
  if (st.blocked) return { state: "blocked", reason: st.reason };
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM reservations r WHERE r.book_id = $2 AND r.status = 'Siap Diambil' AND r.expires_at > now() AND r.user_id <> $1) AS reserved_others,
       (SELECT status FROM loans WHERE user_id = $1 AND book_id = $2 AND status IN ${ACTIVE} LIMIT 1) AS my_loan,
       (SELECT id FROM reservations WHERE user_id = $1 AND book_id = $2 AND status IN ('Menunggu','Siap Diambil') LIMIT 1) AS my_reservation_id,
       (SELECT status FROM reservations WHERE user_id = $1 AND book_id = $2 AND status IN ('Menunggu','Siap Diambil') LIMIT 1) AS my_reservation_status`,
    [user.id, book.id]
  );
  const x = rows[0];
  if (x.my_loan) return { state: "has_loan", reason: `Anda sudah memiliki pinjaman atau pengajuan untuk buku ini (${x.my_loan}).` };
  if (st.active_count >= CONFIG.MAX_ACTIVE_LOANS) {
    return { state: "limit", reason: `Batas ${CONFIG.MAX_ACTIVE_LOANS} pinjaman aktif sudah tercapai. Kembalikan salah satu buku terlebih dahulu.` };
  }
  if (book.available_stock - x.reserved_others <= 0) {
    if (x.my_reservation_id) return { state: "reserved", status: x.my_reservation_status, reservationId: x.my_reservation_id };
    return {
      state: "empty",
      reason: x.reserved_others > 0 && book.available_stock > 0
        ? "Eksemplar yang tersisa sedang dicadangkan untuk anggota dalam antrean reservasi."
        : "Semua eksemplar sedang dipinjam. Coba lagi nanti.",
    };
  }
  return { state: "ok", hasReadyReservation: x.my_reservation_status === "Siap Diambil" };
}

// PIN-01: pengajuan pinjam. Status awal Menunggu Konfirmasi, stok BELUM dipotong (BR-01)
export async function requestLoan(user, bookId) {
  return withTransaction(async (c) => {
    // kunci baris peminjam agar dua pengajuan bersamaan tidak melewati batas jumlah pinjaman
    await c.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [user.id]);
    const st = await getBorrowerStatus(user.id, c);
    if (st.blocked) throw new BusinessError(st.reason);

    const { rows } = await c.query(
      `SELECT b.id, b.title, b.available_stock,
              (SELECT COUNT(*) FROM reservations r WHERE r.book_id = b.id AND r.status = 'Siap Diambil'
                  AND r.expires_at > now() AND r.user_id <> $2) AS reserved_others
       FROM books b WHERE b.id = $1 AND b.deleted_at IS NULL`,
      [bookId, user.id]
    );
    const b = rows[0];
    if (!b) throw new BusinessError("Buku tidak ditemukan atau sudah tidak tersedia di koleksi.", 404);
    if (b.available_stock - b.reserved_others <= 0) throw new BusinessError("Semua eksemplar sedang dipinjam. Coba lagi nanti.");

    const dup = await c.query(`SELECT 1 FROM loans WHERE user_id = $1 AND book_id = $2 AND status IN ${ACTIVE}`, [user.id, bookId]);
    if (dup.rowCount > 0) throw new BusinessError("Anda sudah memiliki pengajuan atau pinjaman aktif untuk buku ini.");
    if (st.active_count >= CONFIG.MAX_ACTIVE_LOANS) {
      throw new BusinessError(`Batas ${CONFIG.MAX_ACTIVE_LOANS} pinjaman aktif sudah tercapai. Kembalikan buku terlebih dahulu.`);
    }

    await c.query("INSERT INTO loans (user_id, book_id, status) VALUES ($1, $2, 'Menunggu Konfirmasi')", [user.id, bookId]);
    // jika peminjam memegang reservasi Siap Diambil, reservasi tuntas menjadi pengajuan
    await c.query("UPDATE reservations SET status = 'Selesai' WHERE user_id = $1 AND book_id = $2 AND status = 'Siap Diambil'", [user.id, bookId]);
    return { title: b.title };
  });
}

// PIN-03: Approve. Stok dikurangi 1 dengan SELECT ... FOR UPDATE (BR-01)
export async function approveLoan(staff, loanId) {
  return withTransaction(async (c) => {
    const l = (await c.query("SELECT id, user_id, book_id, status FROM loans WHERE id = $1 FOR UPDATE", [loanId])).rows[0];
    if (!l) throw new BusinessError("Transaksi tidak ditemukan.", 404);
    if (l.status !== LOAN_STATUS.MENUNGGU) throw new BusinessError("Permohonan ini sudah diproses sebelumnya.");

    const b = (await c.query("SELECT id, title, available_stock, max_loan_days, deleted_at FROM books WHERE id = $1 FOR UPDATE", [l.book_id])).rows[0];
    if (b.deleted_at) throw new BusinessError("Buku ini sudah dihapus dari koleksi, permohonan tidak dapat disetujui.");
    if (b.available_stock <= 0) throw new BusinessError("Stok buku sudah habis, persetujuan dibatalkan. Anda dapat menolak permohonan ini dengan alasan.");

    await c.query("UPDATE books SET available_stock = available_stock - 1, updated_at = now() WHERE id = $1", [b.id]);
    const r = (
      await c.query(
        `UPDATE loans SET status = 'Sedang Dipinjam', loan_date = wita_today(),
                due_date = wita_today() + $2::int, approved_by = $3
         WHERE id = $1 RETURNING due_date`,
        [l.id, b.max_loan_days, staff.id]
      )
    ).rows[0];
    await notify(c, l.user_id, "Persetujuan", `Pengajuan pinjaman buku ${b.title} disetujui. Jatuh tempo: ${r.due_date}.`, l.id);
    return { title: b.title, due_date: r.due_date };
  });
}

// PIN-04: Reject dengan alasan wajib
export async function rejectLoan(staff, loanId, reason) {
  return withTransaction(async (c) => {
    const l = (
      await c.query(
        `SELECT l.id, l.user_id, l.status, b.title FROM loans l JOIN books b ON b.id = l.book_id WHERE l.id = $1 FOR UPDATE OF l`,
        [loanId]
      )
    ).rows[0];
    if (!l) throw new BusinessError("Transaksi tidak ditemukan.", 404);
    if (l.status !== LOAN_STATUS.MENUNGGU) throw new BusinessError("Permohonan ini sudah diproses sebelumnya.");
    await c.query("UPDATE loans SET status = 'Ditolak', reject_reason = $2, approved_by = $3 WHERE id = $1", [l.id, reason, staff.id]);
    await notify(c, l.user_id, "Penolakan", `Pengajuan pinjaman buku ${l.title} ditolak. Alasan: ${reason}`, l.id);
    return { title: l.title };
  });
}

// PIN-05 + DEN-01/02: pengembalian, stok + 1, denda otomatis bila terlambat
export async function returnLoan(staff, loanId) {
  return withTransaction(async (c) => {
    const l = (await c.query("SELECT id, user_id, book_id, status FROM loans WHERE id = $1 FOR UPDATE", [loanId])).rows[0];
    if (!l) throw new BusinessError("Transaksi tidak ditemukan.", 404);
    if (l.status !== LOAN_STATUS.DIPINJAM && l.status !== LOAN_STATUS.PERPANJANGAN) {
      throw new BusinessError("Hanya buku yang sedang dipinjam yang dapat dikonfirmasi pengembaliannya.");
    }
    const b = (await c.query("SELECT id, title, fine_per_day FROM books WHERE id = $1 FOR UPDATE", [l.book_id])).rows[0];

    // hari terlambat = max(0, tanggal kembali - jatuh tempo), berbasis tanggal kalender WITA
    const r = (
      await c.query(
        `UPDATE loans SET status = 'Selesai', returned_at = wita_today(), returned_confirmed_by = $2
         WHERE id = $1 RETURNING GREATEST(0, returned_at - due_date) AS late_days`,
        [l.id, staff.id]
      )
    ).rows[0];

    let amount = 0;
    if (r.late_days > 0 && b.fine_per_day > 0) {
      amount = r.late_days * b.fine_per_day;
      await c.query(
        `INSERT INTO fines (loan_id, user_id, late_days, fine_per_day, amount, status) VALUES ($1, $2, $3, $4, $5, 'Tertunggak')`,
        [l.id, l.user_id, r.late_days, b.fine_per_day, amount]
      );
      await notify(c, l.user_id, "Denda", `Denda baru tercatat untuk buku ${b.title} sebesar ${rupiah(amount)}. Mohon lunasi di meja sirkulasi.`, l.id);
    }
    // tutup pengajuan perpanjangan yang masih menggantung
    await c.query(
      `UPDATE loan_extensions SET status = 'Ditolak', processed_by = $2, processed_at = now(),
              note = 'Buku dikembalikan sebelum perpanjangan diproses.'
       WHERE loan_id = $1 AND status = 'Diajukan'`,
      [l.id, staff.id]
    );
    await c.query("UPDATE books SET available_stock = LEAST(available_stock + 1, total_stock), updated_at = now() WHERE id = $1", [b.id]);
    await promoteReservations(c, b.id);
    return { title: b.title, late_days: r.late_days, amount };
  });
}

// PRP-01
export async function requestExtension(user, loanId) {
  return withTransaction(async (c) => {
    const l = (
      await c.query(
        `SELECT l.id, l.status, l.due_date, l.extension_count, b.title, (l.due_date < wita_today()) AS overdue
         FROM loans l JOIN books b ON b.id = l.book_id WHERE l.id = $1 AND l.user_id = $2 FOR UPDATE OF l`,
        [loanId, user.id]
      )
    ).rows[0];
    if (!l) throw new BusinessError("Transaksi tidak ditemukan.", 404);
    if (l.status !== LOAN_STATUS.DIPINJAM) throw new BusinessError("Perpanjangan hanya dapat diajukan untuk buku yang sedang dipinjam.");
    if (l.overdue) throw new BusinessError("Perpanjangan tidak dapat diajukan karena buku sudah melewati jatuh tempo.");
    if (l.extension_count >= CONFIG.MAX_EXTENSIONS) {
      throw new BusinessError(`Perpanjangan hanya dapat dilakukan ${CONFIG.MAX_EXTENSIONS} kali untuk setiap peminjaman.`);
    }
    const st = await getBorrowerStatus(user.id, c);
    if (st.blocked) throw new BusinessError(st.reason.replace("meminjam", "memperpanjang"));

    await c.query("INSERT INTO loan_extensions (loan_id, status, old_due_date) VALUES ($1, 'Diajukan', $2)", [l.id, l.due_date]);
    await c.query("UPDATE loans SET status = 'Perpanjangan Diajukan' WHERE id = $1", [l.id]);
    return { title: l.title };
  });
}

// PRP-02: pegawai menyetujui / menolak perpanjangan
export async function decideExtension(staff, extId, approve, note) {
  return withTransaction(async (c) => {
    const e = (
      await c.query(
        `SELECT e.id, e.status AS ext_status, l.id AS loan_id, l.user_id, l.status AS loan_status, b.title, b.max_loan_days
         FROM loan_extensions e JOIN loans l ON l.id = e.loan_id JOIN books b ON b.id = l.book_id
         WHERE e.id = $1 FOR UPDATE OF e, l`,
        [extId]
      )
    ).rows[0];
    if (!e) throw new BusinessError("Pengajuan perpanjangan tidak ditemukan.", 404);
    if (e.ext_status !== "Diajukan" || e.loan_status !== LOAN_STATUS.PERPANJANGAN) {
      throw new BusinessError("Pengajuan perpanjangan ini sudah diproses sebelumnya.");
    }
    if (approve) {
      const r = (
        await c.query(
          `UPDATE loans SET due_date = due_date + $2::int, extension_count = extension_count + 1, status = 'Sedang Dipinjam'
           WHERE id = $1 RETURNING due_date`,
          [e.loan_id, e.max_loan_days]
        )
      ).rows[0];
      await c.query(
        "UPDATE loan_extensions SET status = 'Disetujui', new_due_date = $2, processed_by = $3, processed_at = now(), note = $4 WHERE id = $1",
        [e.id, r.due_date, staff.id, note || null]
      );
      await notify(c, e.user_id, "Perpanjangan", `Perpanjangan buku ${e.title} disetujui. Jatuh tempo baru: ${r.due_date}.`, e.loan_id);
      return { title: e.title, approved: true, due_date: r.due_date };
    }
    await c.query("UPDATE loans SET status = 'Sedang Dipinjam' WHERE id = $1", [e.loan_id]);
    await c.query("UPDATE loan_extensions SET status = 'Ditolak', processed_by = $2, processed_at = now(), note = $3 WHERE id = $1", [e.id, staff.id, note]);
    await notify(c, e.user_id, "Perpanjangan", `Perpanjangan buku ${e.title} ditolak. Alasan: ${note}`, e.loan_id);
    return { title: e.title, approved: false };
  });
}

// DEN-03: pelunasan denda (tunai di meja sirkulasi)
export async function payFine(staff, fineId) {
  return withTransaction(async (c) => {
    const r = await c.query(
      `UPDATE fines SET status = 'Lunas', paid_at = now(), recorded_by = $2
       WHERE id = $1 AND status = 'Tertunggak' RETURNING user_id, amount, loan_id`,
      [fineId, staff.id]
    );
    if (r.rowCount === 0) throw new BusinessError("Denda ini sudah lunas atau tidak ditemukan.");
    const f = r.rows[0];
    const st = await getBorrowerStatus(f.user_id, c);
    await notify(c, f.user_id, "Denda", `Denda sebesar ${rupiah(f.amount)} telah dicatat lunas. Terima kasih.`, f.loan_id);
    return { amount: f.amount, stillBlocked: st.blocked };
  });
}

// ULS-01: ulasan hanya untuk transaksi Selesai, satu per transaksi (BR-09)
export async function createReview(user, loanId, rating, comment) {
  return withTransaction(async (c) => {
    const l = (await c.query("SELECT id, book_id, status FROM loans WHERE id = $1 AND user_id = $2 FOR UPDATE", [loanId, user.id])).rows[0];
    if (!l) throw new BusinessError("Transaksi tidak ditemukan.", 404);
    if (l.status !== LOAN_STATUS.SELESAI) throw new BusinessError("Ulasan hanya dapat ditulis setelah buku dikembalikan.");
    await c.query("INSERT INTO reviews (loan_id, book_id, user_id, rating, comment) VALUES ($1, $2, $3, $4, $5)", [
      l.id,
      l.book_id,
      user.id,
      rating,
      comment || null,
    ]);
    return { book_id: l.book_id };
  });
}

// Pengingat H-1 dibangkitkan saat dashboard dibuka (tanpa penjadwal), tidak ganda
export async function generateReminders(userId) {
  await query(
    `INSERT INTO notifications (user_id, type, message, ref_loan_id)
     SELECT l.user_id, 'Pengingat Jatuh Tempo',
            'Buku ' || b.title || ' jatuh tempo besok. Segera kembalikan agar tidak terkena denda.', l.id
     FROM loans l JOIN books b ON b.id = l.book_id
     WHERE l.user_id = $1 AND l.status IN ${BORROWED} AND l.due_date = wita_today() + 1
     ON CONFLICT DO NOTHING`,
    [userId]
  );
}
