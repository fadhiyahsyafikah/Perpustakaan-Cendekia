// Bentuk hasil seragam untuk semua Server Action: { ok, message, errors, values, redirectTo }
export const ok = (message, extra = {}) => ({ ok: true, message, errors: {}, ...extra });
export const fail = (message, errors = {}, values = undefined) => ({ ok: false, message, errors, values });

// Mengubah galat Zod menjadi { namaField: "pesan pertama" }
export function zodErrors(error) {
    const out = {};
    for (const issue of error.issues) {
        const key = issue.path[0] ?? "_";
        if (!out[key]) out[key] = issue.message;
    }
    return out;
}

export function formToObject(formData) {
    const obj = {};
    for (const [k, v] of formData.entries()) {
        if (typeof v === "string") obj[k] = v;
    }
    return obj;
}

// translate galat 
export function dbMessage(err, fallback = "Terjadi kesalahan pada server. Silakan coba lagi.") {
    if (err?.name === "BusinessError") return err.message;
    if (err?.code === "23505") {
        const c = err.constraint || "";
        if (c.includes("email")) return "Email ini sudah terdaftar. Gunakan email lain.";
        if (c.includes("identity")) return "Nomor identitas (NIM/NIP/NIK) sudah terdaftar.";
        if (c.includes("isbn")) return "ISBN sudah dipakai oleh buku lain.";
        if (c.includes("categories_name")) return "Nama kategori sudah ada.";
        if (c.includes("categories_code")) return "Kode kategori sudah ada.";
        if (c.includes("active_user_book")) return "Anda sudah memiliki pengajuan atau pinjaman aktif untuk buku ini.";
        if (c.includes("reviews")) return "Transaksi ini sudah pernah diulas.";
        return "Data yang sama sudah ada.";
    }
    if (err?.code === "23503") return "Data ini masih terhubung dengan data lain, sehingga tidak dapat dihapus.";
    if (err?.code === "23514") return "Data tidak memenuhi aturan basis data. Periksa kembali isian Anda.";
    console.error(err);
    return fallback;
}
