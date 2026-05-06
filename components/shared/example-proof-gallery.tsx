import Link from "next/link";

import { ExampleBoardImage } from "@/components/shared/example-board-image";
import {
  getTemplateExampleProofs,
  type TemplateExampleProof,
} from "@/lib/templates/example-proofs";

export function ExampleProofGallery({
  examples = getTemplateExampleProofs(),
}: {
  examples?: TemplateExampleProof[];
}) {
  return (
    <section className="page-shell py-12 sm:py-16" id="examples">
      <div className="mx-auto max-w-3xl text-center">
        <span className="section-label">Example proofs</span>
        <h2 className="heading-display mt-4 text-4xl font-semibold text-stone-950 sm:text-5xl">
          See what your proof can look like
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-600">
          These sample boards were generated from demo answers using the same proof
          system customers see before checkout. Your version uses your names,
          places, jokes, and stories.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {examples.map((example) => (
          <article key={example.slug} className="catalog-card flex flex-col p-4">
            <div className="overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-white shadow-[0_16px_38px_rgba(52,36,27,0.08)]">
              <ExampleBoardImage
                example={example}
                alt={`${example.templateName} exact example board`}
              />
            </div>

            <div className="flex flex-1 flex-col pt-5">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-500">
                Sample for {example.recipientName}
              </div>
              <h3 className="heading-display mt-2 text-3xl font-semibold leading-none text-stone-950">
                {example.templateName}
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{example.scenario}</p>

              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[#fffdf9] p-4">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-500">
                  Sample card
                </div>
                <div className="mt-2 text-sm font-bold text-stone-950">
                  {example.primaryCard.title}
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-stone-600">
                  {example.primaryCard.body}
                </p>
              </div>

              <Link href={`/create/${example.slug}`} className="catalog-cta mt-5">
                Start this format
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FeaturedProofCard({ example }: { example: TemplateExampleProof }) {
  return (
    <div className="hero-proof-card">
      <div className="hero-proof-board">
        <ExampleBoardImage
          example={example}
          alt={`${example.templateName} exact generated board`}
        />
      </div>
    </div>
  );
}
