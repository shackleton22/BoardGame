import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { getLaunchConfig } from "@/lib/launch/config";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/create", label: "Choose a game format" },
      { href: "/faq", label: "How it works" },
      { href: "/order/lookup", label: "Order lookup" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/shipping-policy", label: "Shipping policy" },
      { href: "/refund-policy", label: "Refund policy" },
      { href: "/contact-support", label: "Contact support" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  const launchConfig = getLaunchConfig();
  const supportEmail = launchConfig.supportEmail;

  return (
    <footer className="mt-24 border-t border-[var(--line)] bg-[rgba(255,251,246,0.82)]">
      <div className="page-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div>
              <div className="heading-display text-3xl font-semibold text-stone-950">
                {APP_NAME}
              </div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
                Custom board-game gifts for milestones, families, relationships, and
                friend-group lore. You tell us the story, approve the proof, and we
                handle the final files and boxed delivery.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
                {launchConfig.supportPromiseCopy}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Proof before print",
                "US-only launch",
                "Guest checkout",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-[var(--line)] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {column.title}
                </div>
                <div className="mt-4 space-y-3 text-sm text-stone-700">
                  {column.links.map((link) => (
                    <Link key={link.href} href={link.href} className="block hover:text-stone-950">
                      {link.label}
                    </Link>
                  ))}
                  {column.title === "Help" ? (
                    <a href={`mailto:${supportEmail}`} className="block hover:text-stone-950">
                      {supportEmail}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
