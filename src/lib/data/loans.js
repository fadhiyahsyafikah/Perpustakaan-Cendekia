import { query } from "@/lib/db";
import { CONFIG } from "@/lib/config";

const escapeLike = (s) => s.replace(/[\\%_]/g, (m) => "\\" + m);
const like = (q) => "%" + escapeLike(String(q).trim().slice(0, 100)) + "%";

// ---------- Mahasiswa ----------
export async function studentActiveLoans(userId) {
  const { rows } = await query(
    `SELECT l.id, l.status, l.loan_date, l.due_date, l.extension_count, l.requested_at,
            b.id AS book_id, b.title, b.author, b.cover_url, b.fine_per_day,
            (l.due_date - wita_today()) AS days_left,
            GREATEST(0, wita_today() - l.due_date) AS late_days,
            GREATEST(0, wita_today() - l.due_date) * b.fine_per_day AS running_fine,
            (SELECT e.status FROM loan_extensions e WHERE e.loan_id = l.id ORDER BY e.id DESC LIMIT 1) AS ext_status,
            (SELECT e.note FROM loan_extensions e WHERE e.loan_id = l.id ORDER BY e.id DESC LIMIT 1) AS ext_note
     FROM loans l JOIN books b ON b.id = l.book_id
     WHERE l.user_id = $1 AND l.status IN ('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan')
     ORDER BY (l.status = 'Menunggu Konfirmasi'), l.due_date NULLS LAST, l.requested_at`,
    [userId]
  );
  return rows;
}

export async function studentHistory(userId, { halaman = 1, pageSize = CONFIG.ADMIN_PAGE_SIZE } = {}) {
  const total = (await query("SELECT COUNT(*) AS n FROM loans WHERE user_id = $1 AND status IN ('Selesai','Ditolak')", [userId])).rows[0].n;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, parseInt(halaman, 10) || 1), pages);
  const { rows } = await query(
    `SELECT l.id, l.status, l.requested_at, l.loan_date, l.due_date, l.returned_at, l.reject_reason,
            b.id AS book_id, b.title, b.author, b.cover_url,
            r.id AS review_id, r.rating, r.comment,
            f.amount AS fine_amount, f.status AS fine_status
     FROM loans l JOIN books b ON b.id = l.book_id
     LEFT JOIN reviews r ON r.loan_id = l.id
     LEFT JOIN fines f ON f.loan_id = l.id
     WHERE l.user_id = $1 AND l.status IN ('Selesai','Ditolak')
     ORDER BY l.requested_at DESC, l.id DESC LIMIT $2 OFFSET $3`,
    [userId, pageSize, (page - 1) * pageSize]
  );
  return { items: rows, total, page, pages };
}

export async function studentFines(userId) {
  const { rows } = await query(
    `SELECT f.id, f.amount, f.late_days, f.fine_per_day, f.created_at, b.title
     FROM fines f JOIN loans l ON l.id = f.loan_id JOIN books b ON b.id = l.book_id
     WHERE f.user_id = $1 AND f.status = 'Tertunggak' ORDER BY f.created_at`,
    [userId]
  );
  return rows;
}

export async function studentReservations(userId) {
  const { rows } = await query(
    `SELECT r.id, r.status, r.created_at, r.expires_at, b.id AS book_id, b.title, b.author, b.cover_url,
            (SELECT COUNT(*) FROM reservations r2 WHERE r2.book_id = r.book_id AND r2.status = 'Menunggu'
               AND (r2.created_at, r2.id) < (r.created_at, r.id)) + 1 AS queue_no
     FROM reservations r JOIN books b ON b.id = r.book_id
     WHERE r.user_id = $1 AND r.status IN ('Menunggu','Siap Diambil') ORDER BY r.created_at`,
    [userId]
  );
  return rows;
}

export async function studentNotifications(userId, limit = 50) {
  const { rows } = await query(
    "SELECT id, type, message, is_read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2",
    [userId, limit]
  );
  return rows;
}

export async function unreadCount(userId) {
  return (await query("SELECT COUNT(*) AS n FROM notifications WHERE user_id = $1 AND is_read = FALSE", [userId])).rows[0].n;
}

// ---------- Pegawai ----------
export async function pendingLoanQueue(q = "") {
  const params = [];
  let extra = "";
  if (q) {
    params.push(like(q));
    extra = `AND (u.identity_number ILIKE $1 OR u.full_name ILIKE $1 OR b.title ILIKE $1)`;
  }
  const { rows } = await query(
    `SELECT l.id, l.requested_at, u.full_name, u.identity_number, u.role,
            b.id AS book_id, b.title, b.author, b.cover_url, b.available_stock, b.max_loan_days
     FROM loans l JOIN users u ON u.id = l.user_id JOIN books b ON b.id = l.book_id
     WHERE l.status = 'Menunggu Konfirmasi' ${extra}
     ORDER BY l.requested_at ASC, l.id ASC LIMIT 100`,
    params
  );
  return rows;
}

// Meja sirkulasi: transaksi aktif beserta perkiraan denda bila dikembalikan hari ini
export async function circulationLoans(q = "") {
  const params = [];
  let extra = "";
  if (q) {
    params.push(like(q));
    extra = `AND (u.identity_number ILIKE $1 OR u.full_name ILIKE $1 OR b.title ILIKE $1)`;
  }
  const { rows } = await query(
    `SELECT l.id, l.status, l.loan_date, l.due_date, u.full_name, u.identity_number, u.role,
            b.id AS book_id, b.title, b.fine_per_day,
            (l.due_date - wita_today()) AS days_left,
            GREATEST(0, wita_today() - l.due_date) AS late_days,
            GREATEST(0, wita_today() - l.due_date) * b.fine_per_day AS est_fine
     FROM loans l JOIN users u ON u.id = l.user_id JOIN books b ON b.id = l.book_id
     WHERE l.status IN ('Sedang Dipinjam','Perpanjangan Diajukan') ${extra}
     ORDER BY l.due_date ASC, l.id ASC LIMIT 100`,
    params
  );
  return rows;
}

export async function extensionQueue() {
  const { rows } = await query(
    `SELECT e.id, e.requested_at, e.old_due_date, (e.old_due_date + b.max_loan_days) AS proposed_due, b.max_loan_days,
            u.full_name, u.identity_number, u.role, b.title, b.id AS book_id
     FROM loan_extensions e JOIN loans l ON l.id = e.loan_id
     JOIN users u ON u.id = l.user_id JOIN books b ON b.id = l.book_id
     WHERE e.status = 'Diajukan' AND l.status = 'Perpanjangan Diajukan'
     ORDER BY e.requested_at ASC`
  );
  return rows;
}

export async function finesList({ status = "Tertunggak", q = "" } = {}) {
  const params = [status === "Lunas" ? "Lunas" : "Tertunggak"];
  let extra = "";
  if (q) {
    params.push(like(q));
    extra = `AND (u.identity_number ILIKE $2 OR u.full_name ILIKE $2 OR b.title ILIKE $2)`;
  }
  const { rows } = await query(
    `SELECT f.id, f.amount, f.late_days, f.fine_per_day, f.status, f.created_at, f.paid_at,
            u.full_name, u.identity_number, u.role, b.title, p.full_name AS recorded_by_name
     FROM fines f JOIN users u ON u.id = f.user_id JOIN loans l ON l.id = f.loan_id
     JOIN books b ON b.id = l.book_id LEFT JOIN users p ON p.id = f.recorded_by
     WHERE f.status = $1 ${extra}
     ORDER BY f.created_at DESC, f.id DESC LIMIT 100`,
    params
  );
  return rows;
}

export async function staffCounts() {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM loans WHERE status = 'Menunggu Konfirmasi') AS pending,
       (SELECT COUNT(*) FROM loan_extensions e JOIN loans l ON l.id = e.loan_id WHERE e.status = 'Diajukan' AND l.status = 'Perpanjangan Diajukan') AS extensions,
       (SELECT COUNT(*) FROM fines WHERE status = 'Tertunggak') AS fines_open,
       (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE status = 'Tertunggak') AS fines_open_total,
       (SELECT COUNT(*) FROM loans WHERE status IN ('Sedang Dipinjam','Perpanjangan Diajukan')) AS borrowed,
       (SELECT COUNT(*) FROM loans WHERE status IN ('Sedang Dipinjam','Perpanjangan Diajukan') AND due_date < wita_today()) AS overdue`
  );
  return rows[0];
}

// ---------- Admin ----------
// Statistik agregat multi-tabel (DSH-03)
export async function adminStats() {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM books WHERE deleted_at IS NULL)                                          AS total_titles,
       (SELECT COALESCE(SUM(total_stock), 0) FROM books WHERE deleted_at IS NULL)                     AS total_copies,
       (SELECT COUNT(*) FROM users WHERE role = 'mahasiswa')                                          AS total_students,
       (SELECT COUNT(*) FROM users WHERE role = 'umum')                                               AS total_public,
       (SELECT COUNT(*) FROM loans WHERE status IN ('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan')) AS active_loans,
       (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE status = 'Lunas')                            AS paid_fines`
  );
  return rows[0];
}

// Monitoring seluruh transaksi (dipakai halaman Admin dan Route Handler GET /api/loans)
export async function searchLoans({ status, from, to, q, halaman = 1, pageSize = CONFIG.ADMIN_PAGE_SIZE } = {}) {
  const params = [];
  const where = ["TRUE"];
  if (status) {
    params.push(status);
    where.push(`l.status = $${params.length}`);
  }
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
    params.push(from);
    where.push(`(l.requested_at AT TIME ZONE 'Asia/Makassar')::date >= $${params.length}::date`);
  }
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    params.push(to);
    where.push(`(l.requested_at AT TIME ZONE 'Asia/Makassar')::date <= $${params.length}::date`);
  }
  if (q) {
    params.push(like(q));
    where.push(`(u.full_name ILIKE $${params.length} OR u.identity_number ILIKE $${params.length} OR b.title ILIKE $${params.length})`);
  }
  const whereSql = where.join(" AND ");
  const base = `FROM loans l JOIN users u ON u.id = l.user_id JOIN books b ON b.id = l.book_id LEFT JOIN fines f ON f.loan_id = l.id WHERE ${whereSql}`;
  const total = (await query(`SELECT COUNT(*) AS n ${base}`, params)).rows[0].n;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, parseInt(halaman, 10) || 1), pages);
  const { rows } = await query(
    `SELECT l.id, l.status, l.requested_at, l.loan_date, l.due_date, l.returned_at,
            u.full_name, u.identity_number, u.role, b.title,
            f.amount AS fine_amount, f.status AS fine_status,
            (l.status IN ('Sedang Dipinjam','Perpanjangan Diajukan') AND l.due_date < wita_today()) AS overdue
     ${base} ORDER BY l.requested_at DESC, l.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, (page - 1) * pageSize]
  );
  return { items: rows, total, page, pages };
}

// Baris untuk laporan CSV (opsional, PRD 10.3)
export async function reportRows({ type = "transaksi", from, to, status }) {
  const params = [];
  const where = ["TRUE"];
  if (status) {
    params.push(status);
    where.push(type === "denda" ? `f.status = $${params.length}` : `l.status = $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`(l.requested_at AT TIME ZONE 'Asia/Makassar')::date >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    where.push(`(l.requested_at AT TIME ZONE 'Asia/Makassar')::date <= $${params.length}::date`);
  }
  if (type === "denda") {
    const { rows } = await query(
      `SELECT f.id, u.identity_number, u.role, u.full_name, b.title, l.due_date, l.returned_at, f.late_days, f.fine_per_day, f.amount, f.status, f.paid_at
       FROM fines f JOIN loans l ON l.id = f.loan_id JOIN users u ON u.id = f.user_id JOIN books b ON b.id = l.book_id
       WHERE ${where.join(" AND ")} ORDER BY f.created_at DESC`,
      params
    );
    return rows;
  }
  const { rows } = await query(
    `SELECT l.id, u.identity_number, u.role, u.full_name, b.title, b.isbn, l.status, l.requested_at, l.loan_date, l.due_date, l.returned_at,
            f.amount AS fine_amount, f.status AS fine_status
     FROM loans l JOIN users u ON u.id = l.user_id JOIN books b ON b.id = l.book_id LEFT JOIN fines f ON f.loan_id = l.id
     WHERE ${where.join(" AND ")} ORDER BY l.requested_at DESC`,
    params
  );
  return rows;
}
