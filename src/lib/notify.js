// Mencatat notifikasi untuk mahasiswa (fitur opsional). Dipakai di dalam transaksi aktif.
export async function notify(client, userId, type, message, loanId = null) {
    await client.query(
        "INSERT INTO notifications (user_id, type, message, ref_loan_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
        [userId, type, message, loanId]
    );
}