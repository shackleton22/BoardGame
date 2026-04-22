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
  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="max-w-3xl">
          <span className="section-label">{eyebrow}</span>
          <h1 className="heading-display mt-5 text-5xl font-semibold text-stone-950">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">{intro}</p>
        </div>
        <div className="mt-10 max-w-3xl glass-panel rounded-[2rem] p-8 text-sm leading-7 text-stone-700">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
