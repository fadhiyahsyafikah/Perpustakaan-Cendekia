"use client";

import { useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import { btn, ctl } from "@/lib/styles";

const DEBOUNCE_MS = 350;
const isReadyDate = (v) =>
    v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && Number(v.slice(0, 4)) >= 1900);

export default function AutoFilterBar({ fields = [], values = {} }) {
  const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const refs = useRef({});
    const timerRef = useRef(null);
    const lastSentRef = useRef({ ...values });

    // Sinkronkan kontrol saat URL berubah dari luar (mis. tombol Back/Forward, sidebar, atau "Hapus filter")
    useEffect(() => {
        let synced = false;
        for (const f of fields) {
        const incoming = values[f.name] ?? "";
        if (refs.current[f.name] && incoming !== (lastSentRef.current[f.name] ?? "")) {
            refs.current[f.name].value = incoming;
            lastSentRef.current[f.name] = incoming;
            synced = true;
        }
        }
        if (synced) clearTimeout(timerRef.current);
    }, [fields, values]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const applyFilters = (overrides = {}, force = false) => {
        clearTimeout(timerRef.current);

        const next = {};
        let changed = false;

        for (const f of fields) {
        const raw =
            overrides[f.name] !== undefined
            ? overrides[f.name]
            : (refs.current[f.name]?.value ?? "");

        let cleaned = raw;
        if (f.type === "search") {
            cleaned = raw.trim();
        } else if (f.type === "date") {
            cleaned = isReadyDate(raw) ? raw : (lastSentRef.current[f.name] ?? "");
        }

        next[f.name] = cleaned;
        if (cleaned !== (lastSentRef.current[f.name] ?? "")) {
            changed = true;
        }
        }

        if (!force && !changed) return;

        lastSentRef.current = next;

        const sp = new URLSearchParams();
        for (const f of fields) {
        if (next[f.name]) sp.set(f.name, next[f.name]);
        }
        const qs = sp.toString();

        startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        });
    };

    const handleSearchChange = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
        applyFilters();
        }, DEBOUNCE_MS);
    };

    const handleDateChange = (val) => {
        if (isReadyDate(val)) applyFilters();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        applyFilters({}, true);
    };

    const handleReset = () => {
        clearTimeout(timerRef.current);
        const cleared = {};
        for (const f of fields) {
        if (refs.current[f.name]) refs.current[f.name].value = "";
        cleared[f.name] = "";
        }
        applyFilters(cleared, true);
    };

    return (
        <form
        action={pathname}
        method="get"
        role="search"
        onSubmit={handleSubmit}
        className="mb-4 flex flex-wrap items-end gap-2.5 [&>div]:flex-[1_1_200px] [&>button]:flex-none [&>a]:flex-none"
        >
        {fields.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
            <label htmlFor={f.name} className="text-[0.9375rem] font-semibold text-n-900">
                {f.label}
            </label>

            {f.type === "search" && (
                <div className="relative [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-1/2 [&>svg]:left-3.5 [&>svg]:-translate-y-1/2 [&>svg]:text-n-500 [&_input]:pl-[46px]">
                {isPending ? (
                    <LoaderCircle size={20} className="animate-spin text-navy-800!" aria-hidden="true" />
                ) : (
                    <Search size={20} aria-hidden="true" />
                )}
                <input
                    ref={(el) => {
                    refs.current[f.name] = el;
                    }}
                    id={f.name}
                    name={f.name}
                    type="search"
                    className={ctl.input}
                    defaultValue={values[f.name] ?? ""}
                    placeholder={f.placeholder}
                    onChange={handleSearchChange}
                />
                </div>
            )}

            {f.type === "select" && (
                <select
                ref={(el) => {
                    refs.current[f.name] = el;
                }}
                id={f.name}
                name={f.name}
                className={ctl.select}
                defaultValue={values[f.name] ?? ""}
                onChange={() => applyFilters()}
                >
                <option value="">{f.placeholder || "Semua"}</option>
                {(f.options || []).map((opt) => {
                    const optValue = typeof opt === "object" ? String(opt.value) : String(opt);
                    const optLabel = typeof opt === "object" ? opt.label : opt;
                    return (
                    <option key={optValue} value={optValue}>
                        {optLabel}
                    </option>
                    );
                })}
                </select>
            )}

            {f.type === "date" && (
                <input
                ref={(el) => {
                    refs.current[f.name] = el;
                }}
                id={f.name}
                name={f.name}
                type="date"
                className={ctl.input}
                defaultValue={values[f.name] ?? ""}
                onChange={(e) => handleDateChange(e.target.value)}
                />
            )}
            </div>
        ))}

        <button
            type="button"
            onClick={handleReset}
            className={btn("outline", "md", false, "min-h-12 bg-white")}
        >
            Hapus
        </button>
        </form>
    );
}