import { query } from "@/lib/db";
import { CONFIG } from "@/lib/config";

// BR-13: publik hanya melihat Published dengan tanggal rilis <= hari ini
const PUBLIC = "a.status = 'Published' AND a.release_date <= wita_today()";

export async function latestAnnouncements(limit = 3) {
    const { rows } = await query(
        `SELECT a.id, a.title, a.content, a.category, a.release_date FROM announcements a
        WHERE ${PUBLIC} ORDER BY a.release_date DESC, a.id DESC LIMIT $1`,
        [limit]
    );
    return rows;
}

export async function listPublicAnnouncements({ kategori, halaman = 1, pageSize = 9 } = {}) {
    const params = [];
    let where = PUBLIC;
    if (kategori) {
        params.push(kategori);
        where += ` AND a.category = $${params.length}`;
    }
    const total = (await query(`SELECT COUNT(*) AS n FROM announcements a WHERE ${where}`, params)).rows[0].n;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, parseInt(halaman, 10) || 1), pages);
    const { rows } = await query(
        `SELECT a.id, a.title, a.content, a.category, a.release_date FROM announcements a
        WHERE ${where} ORDER BY a.release_date DESC, a.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, (page - 1) * pageSize]
    );
    return { items: rows, total, page, pages };
    }

    export async function getPublicAnnouncement(id) {
    const { rows } = await query(
        `SELECT a.id, a.title, a.content, a.category, a.release_date, u.full_name AS author
        FROM announcements a JOIN users u ON u.id = a.author_id WHERE a.id = $1 AND ${PUBLIC}`,
        [id]
    );
    return rows[0] || null;
    }

    export async function otherAnnouncements(excludeId, limit = 3) {
    const { rows } = await query(
        `SELECT a.id, a.title, a.category, a.release_date FROM announcements a
        WHERE ${PUBLIC} AND a.id <> $1 ORDER BY a.release_date DESC LIMIT $2`,
        [excludeId, limit]
    );
    return rows;
    }

// Pengelolaan (Pegawai/Admin): semua status, dapat disaring
export async function listAnnouncementsManage({ status, kategori, halaman = 1 } = {}) {
    const params = [];
    const where = ["TRUE"];
    if (status) {
        params.push(status);
        where.push(`a.status = $${params.length}`);
    }
    if (kategori) {
        params.push(kategori);
        where.push(`a.category = $${params.length}`);
    }
    const pageSize = CONFIG.ADMIN_PAGE_SIZE;
    const total = (await query(`SELECT COUNT(*) AS n FROM announcements a WHERE ${where.join(" AND ")}`, params)).rows[0].n;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, parseInt(halaman, 10) || 1), pages);
    const { rows } = await query(
        `SELECT a.id, a.title, a.category, a.status, a.release_date, u.full_name AS author,
                (a.status = 'Published' AND a.release_date <= wita_today()) AS is_live
        FROM announcements a JOIN users u ON u.id = a.author_id
        WHERE ${where.join(" AND ")} ORDER BY a.release_date DESC, a.id DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, (page - 1) * pageSize]
    );
    return { items: rows, total, page, pages };
    }

export async function getAnnouncement(id) {
    const { rows } = await query("SELECT * FROM announcements WHERE id = $1", [id]);
    return rows[0] || null;
}