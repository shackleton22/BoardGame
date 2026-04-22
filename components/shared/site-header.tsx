import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(255,250,244,0.84)] backdrop-blur-xl">
      <div className="page-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-strong)] text-sm font-bold tracking-[0.2em] text-white">
            GG
          </div>
          <div>
            <div className="heading-display text-2xl font-semibold">{APP_NAME}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Personalized board-game gifts
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-stone-700 lg:flex">
          <Link href="/create">Templates</Link>
          <Link href="/order/lookup">Order lookup</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact-support">Support</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
