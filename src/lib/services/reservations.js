// Reservasi buku (fitur opsional, PRD 10.1)
import { query, withTransaction, BusinessError } from "@/lib/db";
import { CONFIG } from "@/lib/config";
import { notify } from "@/lib/notify";
import { getBorrowerStatus } from "@/lib/services/borrower";

// Memanggil antrean berikutnya selama masih ada eksemplar yang belum dicadangkan.
// Dipanggil di dalam transaksi yang sudah mengunci baris buku.
export async function promoteReservations(c, bookId) {
  await c.query(
    "UPDATE reservations SET status = 'Kedaluwarsa' WHERE book_id = $1 AND status = 'Siap Diambil' AND expires_at < now()",
    [bookId]
  );
  const b = (await c.query("SELECT title, available_stock FROM books WHERE id = $1", [bookId])).rows[0];
  if (!b) return;
  const held = (await c.query("SELECT COUNT(*) AS n FROM reservations WHERE book_id = $1 AND status = 'Siap Diambil'", [bookId])).rows[0].n;
  let free = b.available_stock - held;
  while (free > 0) {
    const r = (
      await c.query(
        `UPDATE reservations SET status = 'Siap Diambil', expires_at = now() + $2 * INTERVAL '1 day'
         WHERE id = (SELECT id FROM reservations WHERE book_id = $1 AND status = 'Menunggu' ORDER BY created_at, id LIMIT 1 FOR UPDATE SKIP LOCKED)
         RETURNING user_id`,
        [bookId, CONFIG.RESERVATION_HOLD_DAYS]
      )
    ).rows[0];
    if (!r) break;
    await notify(c, r.user_id, "Reservasi", `Buku ${b.title} yang Anda reservasi siap diambil. Ajukan pinjam dalam ${CONFIG.RESERVATION_HOLD_DAYS} hari.`);
    free -= 1;
  }
}

// Reservasi yang lewat batas ambil menjadi Kedaluwarsa dan antrean berikutnya dipanggil
export async function sweepExpiredReservations() {
  const { rows } = await query("SELECT DISTINCT book_id FROM reservations WHERE status = 'Siap Diambil' AND expires_at < now()");
  for (const { book_id } of rows) {
    await withTransaction(async (c) => {
      await c.query("SELECT id FROM books WHERE id = $1 FOR UPDATE", [book_id]);
      await promoteReservations(c, book_id);
    });
  }
}

export async function createReservation(user, bookId) {
  return withTransaction(async (c) => {
    const st = await getBorrowerStatus(user.id, c);
    if (st.blocked) throw new BusinessError(st.reason.replace("meminjam", "melakukan reservasi"));
    const b = (await c.query("SELECT id, title, available_stock FROM books WHERE id = $1 AND deleted_at IS NULL FOR UPDATE", [bookId])).rows[0];
    if (!b) throw new BusinessError("Buku tidak ditemukan.", 404);
    if (b.available_stock > 0) throw new BusinessError("Buku ini masih tersedia, Anda dapat langsung mengajukan pinjam.");
    const loan = await c.query(
      "SELECT 1 FROM loans WHERE user_id = $1 AND book_id = $2 AND status IN ('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan')",
      [user.id, bookId]
    );
    if (loan.rowCount > 0) throw new BusinessError("Anda sedang meminjam atau mengajukan buku ini.");
    await c.query("INSERT INTO reservations (book_id, user_id, status) VALUES ($1, $2, 'Menunggu')", [bookId, user.id]);
    return { title: b.title };
  });
}

export async function cancelReservation(user, id) {
  return withTransaction(async (c) => {
    const r = (await c.query("SELECT id, book_id, status FROM reservations WHERE id = $1 AND user_id = $2 FOR UPDATE", [id, user.id])).rows[0];
    if (!r) throw new BusinessError("Reservasi tidak ditemukan.", 404);
    if (r.status !== "Menunggu" && r.status !== "Siap Diambil") throw new BusinessError("Reservasi ini sudah tidak aktif.");
    await c.query("SELECT id FROM books WHERE id = $1 FOR UPDATE", [r.book_id]);
    await c.query("UPDATE reservations SET status = 'Dibatalkan' WHERE id = $1", [r.id]);
    await promoteReservations(c, r.book_id);
    return {};
  });
}
