import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { ActionForm } from "@/components/form";
import RegisterFields from "@/components/RegisterFields";
import { registerAccount } from "@/actions/auth";
import { getCurrentUser, homeFor } from "@/lib/session";
import { campusDomains } from "@/lib/config";
import { btn } from "@/lib/styles";

export const metadata = { title: "Daftar Akun" };

export default async function RegisterPage() {
    const user = await getCurrentUser();
    if (user) redirect(homeFor(user.role));
    const domain = campusDomains()[0] || "ac.id";
    return (
        <AuthShell>
        <h1>Daftar Akun</h1>
        <p className="mb-5 text-n-700">Buat akun untuk meminjam buku dan menulis ulasan. Pilih jenis akun yang sesuai dengan Anda.</p>
        <ActionForm action={registerAccount} className="grid gap-18px" inlineError>
            <RegisterFields domain={domain} />
        </ActionForm>
        <p className="mt-18px mb-0 text-center text-[0.9375rem] [&_a]:font-semibold">Sudah punya akun? <Link href="/login">Masuk</Link></p>
        <div className="my-18px flex items-center gap-3 text-sm text-n-500 before:h-px before:flex-1 before:bg-n-200 before:content-[''] after:h-px after:flex-1 after:bg-n-200 after:content-['']">atau</div>
        <Link href="/katalog" className={btn("outline", "lg", true)}><Compass size={20} aria-hidden="true" /> Continue as Guest</Link>
        </AuthShell>
    );
}
