import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn, Compass, CircleCheck } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { ActionForm, SubmitButton, TextField } from "@/components/form";
import { Alert } from "@/components/ui";
import { login } from "@/actions/auth";
import { getCurrentUser, homeFor } from "@/lib/session";
import { str } from "@/lib/format";
import { btn } from "@/lib/styles";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }) {
    const sp = await searchParams;
    const user = await getCurrentUser();
    if (user) redirect(homeFor(user.role));
    const next = str(sp.next);

    return (
        <AuthShell>
            <h1>Masuk</h1>
            <p className="text-n-700">Masuk dengan akun Admin, Pegawai, Mahasiswa, atau Pengunjung Umum.</p>
            {str(sp.registered) && (
                <Alert tone="success" icon={CircleCheck} title="Pendaftaran berhasil">Silakan masuk dengan email dan password yang baru Anda buat.</Alert>
            )}
            <ActionForm action={login} className="grid gap-[18px]" inlineError>
                <input type="hidden" name="next" value={next} />
                <TextField label="Email" name="email" type="email" required autoComplete="email" placeholder="nama@kampus.ac.id" />
                <TextField label="Password" name="password" type="password" required autoComplete="current-password" />
                <div className="mt-1.5">
                    <SubmitButton size="lg" block icon={<LogIn size={18} aria-hidden="true" />} pendingText="Sedang masuk...">Masuk</SubmitButton>
                </div>
            </ActionForm>
            <p className="mt-[18px] mb-0 text-center text-[0.9375rem] [&_a]:font-semibold">Belum punya akun? <Link href="/register">Daftar akun baru</Link></p>
            <div className="my-[18px] flex items-center gap-3 text-sm text-n-500 before:h-px before:flex-1 before:bg-n-200 before:content-[''] after:h-px after:flex-1 after:bg-n-200 after:content-['']">atau</div>
            <Link href="/katalog" className={btn("outline", "lg", true)}><Compass size={20} aria-hidden="true" /> Continue as Guest</Link>
            <p className="mt-2.5 mb-0 text-center text-sm text-n-700">Guest dapat melihat katalog dan pengumuman tanpa akun.</p>
        </AuthShell>
    );
}