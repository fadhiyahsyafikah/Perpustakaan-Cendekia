import { Pool, types } from "pg";

// DATE -> teks "YYYY-MM-DD" (hindari pergeseran zona waktu), COUNT/SUM (bigint) -> angka, NUMERIC -> angka
types.setTypeParser(1082, (v) => v);
types.setTypeParser(20, (v) => parseInt(v, 10));
types.setTypeParser(1700, (v) => parseFloat(v));

const globalForPg = globalThis;

// Satu pool dipakai bersama (aman terhadap hot reload saat pengembangan)
const pool =
    globalForPg.__cendekiaPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
    });
if (process.env.NODE_ENV !== "production") globalForPg.__cendekiaPool = pool;

// Seluruh query memakai parameter ($1, $2, ...). Jangan menggabungkan input pengguna ke teks SQL.
export function query(text, params = []) {
    return pool.query(text, params);
}

// Menjalankan beberapa query dalam satu transaksi (BEGIN, COMMIT, ROLLBACK)
export async function withTransaction(fn) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        try {
        await client.query("ROLLBACK");
        } catch {}
        throw err;
    } finally {
        client.release();
    }
}

// Dipakai untuk membatalkan transaksi dengan pesan yang ramah (tidak dianggap error server)
export class BusinessError extends Error {
    constructor(message, status = 409) {
        super(message);
        this.name = "BusinessError";
        this.status = status;
    }
}

export default pool;
