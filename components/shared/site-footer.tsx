import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { getSupportEmail } from "@/lib/env";

export function SiteFooter() {
  const supportEmail = getSupportEmail();

  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[rgba(255,255,255,0.6)]">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="heading-display text-xl font-semibold text-stone-900">
            {APP_NAME}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-7 text-stone-600">
            Premium personalized board-game gifts for milestones, relationships, family
            stories, and friend-group legends.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
          <Link href="/create">Templates</Link>
          <Link href="/order/lookup">Order lookup</Link>
          <Link href="/shipping-policy">Shipping policy</Link>
          <Link href="/refund-policy">Refund policy</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/faq">FAQ</Link>
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </div>
      </div>
    </footer>
  );
}
