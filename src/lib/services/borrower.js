// Status peminjam: terblokir atau tidak (BR-08)
import { query } from "@/lib/db";
import { rupiah } from "@/lib/format";

const ACTIVE = `('Menunggu Konfirmasi','Sedang Dipinjam','Perpanjangan Diajukan')`;
const BORROWED = `('Sedang Dipinjam','Perpanjangan Diajukan')`;

// BR-08: terblokir bila punya denda Tertunggak ATAU pinjaman aktif yang sudah lewat jatuh tempo
export async function getBorrowerStatus(userId, db = { query }) {
  const { rows } = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM fines WHERE user_id = $1 AND status = 'Tertunggak')                         AS fine_count,
       (SELECT COALESCE(SUM(amount), 0) FROM fines WHERE user_id = $1 AND status = 'Tertunggak')          AS fine_total,
       (SELECT COUNT(*) FROM loans WHERE user_id = $1 AND status IN ${BORROWED} AND due_date < wita_today()) AS overdue_count,
       (SELECT COUNT(*) FROM loans WHERE user_id = $1 AND status IN ${ACTIVE})                            AS active_count`,
    [userId]
  );
  const s = rows[0];
  const blocked = s.fine_count > 0 || s.overdue_count > 0;
  let reason = "";
  if (s.fine_count > 0) {
    reason = `Anda belum dapat meminjam karena masih memiliki denda ${rupiah(s.fine_total)}. Lunasi di meja sirkulasi.`;
  } else if (s.overdue_count > 0) {
    reason = "Anda belum dapat meminjam karena ada buku yang sudah lewat jatuh tempo. Kembalikan buku tersebut di meja sirkulasi.";
  }
  return { ...s, blocked, reason };
}

