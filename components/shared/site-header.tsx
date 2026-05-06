import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/#formats", label: "Choose a format" },
  { href: "/faq", label: "FAQ" },
  { href: "/order/lookup", label: "Order lookup" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(255,253,249,0.82)] backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="brand-mark">
            <span>GG</span>
          </div>
          <div>
            <div className="heading-display text-xl font-semibold text-stone-950">
              {APP_NAME}
            </div>
            <div className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Custom board-game gifts
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-stone-700 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-stone-950">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href="/#formats" className="cta-pill">
            Start
          </Link>
        </div>
      </div>
    </header>
  );
}
