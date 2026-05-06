import Link from "next/link";

import { getSupportEmail } from "@/lib/env";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  const supportEmail = getSupportEmail();

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="launch-note">
          <span>Proof before print</span>
          <span>US-only boxed delivery</span>
          <span>Guest checkout</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <div className="max-w-3xl">
              <span className="section-label">{eyebrow}</span>
              <h1 className="heading-display mt-5 text-5xl font-semibold text-stone-950">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">{intro}</p>
            </div>

            <article className="paper-panel mt-10 rounded-[2.2rem] p-8 text-sm leading-7 text-stone-700 sm:p-10">
              {children}
            </article>
          </div>

          <aside className="space-y-5">
            <div className="ink-panel rounded-[2rem] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,244,230,0.72)]">
                Need a hand?
              </div>
              <h2 className="heading-display mt-4 text-3xl font-semibold text-[var(--paper-ink)]">
                Support stays personal during launch
              </h2>
              <p className="mt-4 text-sm leading-7 text-[rgba(255,244,230,0.82)]">
                Email us if you need help with a proof, a shipping question, or an order
                update.
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="mt-5 inline-flex rounded-full border border-[rgba(255,244,230,0.18)] bg-[rgba(255,244,230,0.08)] px-5 py-3 text-sm font-semibold text-[var(--paper-ink)]"
              >
                {supportEmail}
              </a>
            </div>

            <div className="paper-panel rounded-[1.8rem] p-6">
              <div className="spec-label">Launch promise</div>
              <div className="mt-4 space-y-3">
                {[
                  "Guided questions instead of blank design tools",
                  "Editable proof before checkout",
                  "Digital delivery or boxed physical shipping",
                ].map((item) => (
                  <div key={item} className="spec-line">
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/order/lookup" className="secondary-pill mt-5 w-full">
                Look up an order
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
