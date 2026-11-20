"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const SELECTORS = [
        "main section",
        "main article",
        'main [class*="grid"] > a',
        'main [class*="grid"] > article',
        'main [class*="grid"] > div',
        "footer > div",
        ].join(", ");

        const observed = new WeakSet();
        const timers = [];

        const revealElement = (el, delay = 0) => {
        el.style.transitionDelay = `${delay}ms`;
        requestAnimationFrame(() => {
            el.classList.add("is-visible");
        });

        // Bersihkan kelas animasi setelah selesai agar efek hover asli kartu tetap normal
        const t = setTimeout(() => {
            el.classList.remove("reveal-item", "is-visible");
            el.style.transitionDelay = "";
        }, 850 + delay);
        timers.push(t);
        };

        const observer = new IntersectionObserver(
        (entries) => {
            let visibleBatch = 0;
            entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const isGridCard = el.parentElement?.className?.includes("grid");
            const delay = isGridCard ? Math.min(visibleBatch * 90, 450) : 0;
            if (isGridCard) visibleBatch += 1;

            revealElement(el, delay);
            observer.unobserve(el);
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -35px 0px",
        }
        );

        const scanElements = () => {
        const candidates = document.querySelectorAll(SELECTORS);
        let initialBatch = 0;

        candidates.forEach((el) => {
            if (observed.has(el)) return;
            // Abaikan elemen di dalam header, sidebar, modal, atau notifikasi
            if (el.closest('header, nav, aside, [role="dialog"], [aria-live]')) return;

            const rect = el.getBoundingClientRect();
            // Abaikan pembungkus kecil (seperti label form) agar hanya bagian & kartu yang dianimasikan
            if (rect.height < 60) return;

            observed.add(el);
            el.classList.add("reveal-item");

            // Jika elemen sudah terlihat di layar saat halaman pertama dibuka
            if (rect.top < window.innerHeight * 0.92) {
            const delay = Math.min(initialBatch * 80, 400);
            initialBatch += 1;
            revealElement(el, delay);
            } else {
            observer.observe(el);
            }
        });
        };

        const startTimer = setTimeout(scanElements, 40);

        // Pantau jika ada konten baru yang dimuat dinamis
        const mutator = new MutationObserver(() => scanElements());
        const mainEl = document.querySelector("main");
        if (mainEl) mutator.observe(mainEl, { childList: true, subtree: true });

        return () => {
        clearTimeout(startTimer);
        timers.forEach(clearTimeout);
        observer.disconnect();
        mutator.disconnect();
        };
    }, [pathname]);

    return null;
}