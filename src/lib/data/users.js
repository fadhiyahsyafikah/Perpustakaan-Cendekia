import { query } from "@/lib/db";
import { CONFIG, ROLES } from "@/lib/config";

export async function listUsers({ role, q, halaman = 1 } = {}) {
    const params = [];
    const where = ["TRUE"];
    if (ROLES.includes(role)) {
        params.push(role);
        where.push(`u.role = $${params.length}`);
    }
    if (q) {
        params.push("%" + String(q).trim().slice(0, 100).replace(/[\\%_]/g, (m) => "\\" + m) + "%");
        where.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.identity_number ILIKE $${params.length})`);
    }
    const pageSize = CONFIG.ADMIN_PAGE_SIZE;
    const w = where.join(" AND ");
    const total = (await query(`SELECT COUNT(*) AS n FROM users u WHERE ${w}`, params)).rows[0].n;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, parseInt(halaman, 10) || 1), pages);
    const { rows } = await query(
        `SELECT u.id, u.full_name, u.email, u.role, u.identity_number, u.is_active, u.created_at,
                (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id) AS loan_count
        FROM users u WHERE ${w} ORDER BY u.role, u.full_name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, pageSize, (page - 1) * pageSize]
    );
    return { items: rows, total, page, pages };
}

export async function getUser(id) {
    const { rows } = await query("SELECT id, full_name, email, role, identity_number, is_active FROM users WHERE id = $1", [id]);
    return rows[0] || null;
}
