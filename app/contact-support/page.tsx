import { ContentPage } from "@/components/shared/content-page";
import { getLaunchConfig } from "@/lib/launch/config";

export default function ContactSupportPage() {
  const launchConfig = getLaunchConfig();
  const supportEmail = launchConfig.supportEmail;

  return (
    <ContentPage
      eyebrow="Support"
      title="Email support during the launch window"
      intro="We keep support focused and personal at launch, so email is the fastest way to get help with a proof, an order, or a shipping question."
    >
      <div className="space-y-8">
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-white px-5 py-5">
          <h2 className="heading-display text-2xl font-semibold text-stone-950">
            The fastest way to reach us
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Email{" "}
            <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--brand-strong)]">
              {supportEmail}
            </a>{" "}
            and include as much context as you can. {launchConfig.supportPromiseCopy}
          </p>
        </div>

        <div>
          <div className="spec-label">What to include</div>
          <div className="mt-4 space-y-3">
            {[
              "Your order number if you have already checked out",
              "The checkout email used on the order",
              "A short description of the issue or question",
              "Any deadline we should know about for the gift",
            ].map((item) => (
              <div key={item} className="spec-line">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContentPage>
  );
}
