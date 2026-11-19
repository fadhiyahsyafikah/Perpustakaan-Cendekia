import { query } from "@/lib/db";
import { CONFIG } from "@/lib/config";

// Whitelist pengurutan: nilai dari pengguna hanya memilih kunci, bukan disisipkan ke SQL
export const SORT_OPTIONS = [
    { value: "judul", label: "Judul (A sampai Z)", sql: "b.title ASC" },
    { value: "terbaru", label: "Tahun terbit (terbaru)", sql: "b.publish_year DESC, b.title ASC" },
    { value: "terlama", label: "Tahun terbit (terlama)", sql: "b.publish_year ASC, b.title ASC" },
    { value: "rating", label: "Rating tertinggi", sql: "rt.avg_rating DESC NULLS LAST, rt.review_count DESC NULLS LAST, b.title ASC" },
];

const RATING_JOIN = `LEFT JOIN (
    SELECT book_id, ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS review_count
    FROM reviews GROUP BY book_id
    ) rt ON rt.book_id = b.id`;

const escapeLike = (s) => s.replace(/[\\%_]/g, (m) => "\\" + m);

// Katalog: pencarian (ILIKE judul / pengarang), filter kategori, pengurutan, pagination
export async function searchBooks({ q = "", kategori, urut, halaman = 1, pageSize = CONFIG.PAGE_SIZE } = {}) {
    const params = [];
    const where = ["b.deleted_at IS NULL"];
    const term = String(q || "").trim().slice(0, 100);
    if (term) {
        params.push("%" + escapeLike(term) + "%");
        where.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length} OR b.isbn ILIKE $${params.length})`);
    }
    const cat = parseInt(kategori, 10);
    if (Number.isInteger(cat) && cat > 0) {
        params.push(cat);
        where.push(`b.category_id = $${params.length}`);
    }
    const sort = SORT_OPTIONS.find((s) => s.value === urut) || SORT_OPTIONS[0];
    const whereSql = where.join(" AND ");

    const total = (await query(`SELECT COUNT(*) AS n FROM books b WHERE ${whereSql}`, params)).rows[0].n;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, parseInt(halaman, 10) || 1), pages);

    const { rows } = await query(
        `SELECT b.id, b.isbn, b.title, b.author, b.publisher, b.publish_year, b.cover_url,
                b.total_stock, b.available_stock, b.max_loan_days, b.fine_per_day,
                c.id AS category_id, c.name AS category_name,
                rt.avg_rating, COALESCE(rt.review_count, 0) AS review_count
        FROM books b
        JOIN categories c ON c.id = b.category_id
        ${RATING_JOIN}
        WHERE ${whereSql}
        ORDER BY ${sort.sql}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, (page - 1) * pageSize]
    );
    return { items: rows, total, page, pages, pageSize, sort: sort.value };
}

// Homepage: Top 5 buku terpopuler (JOIN + COUNT + GROUP BY, imbang diurutkan judul) - BR-14
export async function topBooks(limit = 5) {
    const { rows } = await query(
        `SELECT b.id, b.title, b.author, b.cover_url, b.available_stock, c.name AS category_name,
                lc.loan_count, rt.avg_rating, COALESCE(rt.review_count, 0) AS review_count
        FROM books b
        JOIN categories c ON c.id = b.category_id
        LEFT JOIN (
        SELECT book_id, COUNT(*) AS loan_count FROM loans
        WHERE status IN ('Sedang Dipinjam','Perpanjangan Diajukan','Selesai')
        GROUP BY book_id
        ) lc ON lc.book_id = b.id
        ${RATING_JOIN}
        WHERE b.deleted_at IS NULL
        ORDER BY COALESCE(lc.loan_count, 0) DESC, b.title ASC
        LIMIT $1`,
        [limit]
    );
    return rows.map((r) => ({ ...r, loan_count: r.loan_count || 0 }));
}

export async function getBookDetail(id) {
    const { rows } = await query(
        `SELECT b.*, c.name AS category_name, c.code AS category_code, rt.avg_rating, COALESCE(rt.review_count, 0) AS review_count
        FROM books b JOIN categories c ON c.id = b.category_id ${RATING_JOIN}
        WHERE b.id = $1 AND b.deleted_at IS NULL`,
        [id]
    );
    return rows[0] || null;
}

export async function getReviews(bookId, limit = 50) {
    const { rows } = await query(
        `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name
        FROM reviews r JOIN users u ON u.id = r.user_id
        WHERE r.book_id = $1 ORDER BY r.created_at DESC LIMIT $2`,
        [bookId, limit]
    );
    return rows;
}

// Data buku untuk formulir Edit, termasuk jumlah eksemplar yang sedang dipinjam
export async function getBookForEdit(id) {
    const { rows } = await query(
        `SELECT b.*, (SELECT COUNT(*) FROM loans l WHERE l.book_id = b.id AND l.status IN ('Sedang Dipinjam','Perpanjangan Diajukan')) AS borrowed
        FROM books b WHERE b.id = $1 AND b.deleted_at IS NULL`,
        [id]
    );
    return rows[0] || null;
}

export async function listCategoryOptions() {
    return (await query("SELECT id, name, code FROM categories ORDER BY name")).rows;
}

// Daftar kategori beserta jumlah buku (KAT-01)
export async function listCategories() {
    const { rows } = await query(
        `SELECT c.id, c.name, c.code, c.description,
                COUNT(b.id) FILTER (WHERE b.deleted_at IS NULL) AS book_count,
                COUNT(b.id) AS all_book_count
        FROM categories c LEFT JOIN books b ON b.category_id = c.id
        GROUP BY c.id ORDER BY c.name`
    );
    return rows;
}