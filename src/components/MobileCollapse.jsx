"use client";

import { useEffect, useRef } from "react";
import { SlidersHorizontal } from "lucide-react";
import { btn, cx } from "@/lib/styles";

// Panel filter: terbuka di layar lebar, tertutup (dapat dibuka) di layar kecil
export default function MobileCollapse({ label = "Filter dan urutkan", children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.open = window.innerWidth >= 768;
  }, []);
  return (
    <details ref={ref} className="" open>
      <summary className={cx(btn("outline", "md", true), "list-none md:hidden [&::-webkit-details-marker]:hidden cursor-pointer")}>
        <SlidersHorizontal size={18} aria-hidden="true" /> {label}
      </summary>
      <div className="pt-3.5 md:pt-0">{children}</div>
    </details>
  );
}
