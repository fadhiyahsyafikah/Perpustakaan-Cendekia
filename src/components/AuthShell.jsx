import Link from "next/link";
import { BookOpenCheck, Search, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { cx } from "@/lib/styles";

export default function AuthShell({ children, className = "max-w-[420px]" }) {
  return (
    <main
      id="konten"
      className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-navy-800 via-navy-800 to-navy-900 px-4 py-8"
    >
      <div className={cx("w-full rounded-2xl bg-white p-6 shadow-lg sm:p-7", className)}>
        {children}
      </div>
    </main>
  );
}
