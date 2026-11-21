import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import { ActionForm } from "@/components/form";
import RegisterFields from "@/components/RegisterFields";
import { registerAccount } from "@/actions/auth";
import { getCurrentUser, homeFor } from "@/lib/session";
import { campusDomains } from "@/lib/config";

export const metadata = { title: "Daftar Akun" };

export default async function RegisterPage() {
    const user = await getCurrentUser();
    if (user) redirect(homeFor(user.role));
    const domain = campusDomains()[0] || "ac.id";

    return (
        <AuthShell className="max-w-[460px]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="m-0 text-xl font-bold text-navy-800 sm:text-2xl">Daftar Akun</h1>
            <p className="m-0 text-xs text-n-700">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-navy-600">
                Masuk
            </Link>
            </p>
        </div>
        <p className="mt-1 mb-4 text-sm text-n-700">
            Buat akun untuk meminjam buku dan menulis ulasan.
        </p>

        <ActionForm action={registerAccount} className="grid gap-3.5" inlineError>
            <RegisterFields domain={domain} />
        </ActionForm>

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