import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn, Compass, CircleCheck } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { ActionForm, SubmitButton, TextField } from "@/components/form";
import { Alert } from "@/components/ui";
import { login } from "@/actions/auth";
import { getCurrentUser, homeFor } from "@/lib/session";
import { str } from "@/lib/format";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }) {
    const sp = await searchParams;
    const user = await getCurrentUser();
    if (user) redirect(homeFor(user.role));
    const next = str(sp.next);

    return (
        <AuthShell className="max-w-[390px]">
        <div className="text-center">
            <h1 className="m-0 text-xl font-bold text-navy-800 sm:text-2xl">Masuk</h1>
            <p className="mt-1.5 mb-5 text-sm text-n-700">
            Masuk dengan akun Admin, Pegawai, Mahasiswa, atau Pengunjung Umum.
            </p>
        </div>

        {str(sp.registered) && (
            <div className="mb-4">
            <Alert tone="success" icon={CircleCheck} title="Pendaftaran berhasil">
                Silakan masuk dengan email dan password yang baru Anda buat.
            </Alert>
            </div>
        )}

        <ActionForm action={login} className="grid gap-3.5" inlineError>
            <input type="hidden" name="next" value={next} />
            <TextField
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@kampus.ac.id"
            />
            <TextField
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Masukkan password Anda"
            />
            <div className="mt-1.5">
            <SubmitButton size="md" block icon={<LogIn size={17} aria-hidden="true" />} pendingText="Sedang masuk...">
                Masuk
            </SubmitButton>
            </div>
        </ActionForm>

        <p className="mt-4 mb-0 text-center text-xs text-n-700">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-navy-600">
            Daftar akun baru
            </Link>
        </p>

        <div className="mt-4 border-t border-n-200 pt-3.5 text-center">
            <Link
            href="/katalog"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-n-700 no-underline hover:text-navy-800 hover:no-underline"
            >
            <Compass size={15} className="text-navy-700" aria-hidden="true" />
            <span>
                Atau lanjut jelajahi katalog sebagai <b className="font-semibold text-navy-800">Tamu</b> &rarr;
            </span>
            </Link>
        </div>
        </AuthShell>
    );
}