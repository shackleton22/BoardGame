import { ContentPage } from "@/components/shared/content-page";

export default function FaqPage() {
  return (
    <ContentPage
      eyebrow="FAQ"
      title="Questions customers ask before they buy"
      intro="This launch keeps the offer focused: guest checkout, US shipping, and a small catalog of customizable templates."
    >
      <div className="space-y-6">
        <div>
          <h2 className="heading-display text-3xl font-semibold">How does customization work?</h2>
          <p className="mt-2">
            Customers choose a template, answer a guided questionnaire, review an editable preview,
            and then check out. Final print files are generated after payment.
          </p>
        </div>
        <div>
          <h2 className="heading-display text-3xl font-semibold">Do I need an account?</h2>
          <p className="mt-2">No. Launch checkout is guest-only.</p>
        </div>
        <div>
          <h2 className="heading-display text-3xl font-semibold">How are physical orders fulfilled?</h2>
          <p className="mt-2">
            Boxed games route through The Game Crafter after payment. Shipping is quoted before
            checkout and production starts after the paid order is submitted.
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
