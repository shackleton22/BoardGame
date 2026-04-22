import { ContentPage } from "@/components/shared/content-page";

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy"
      title="Privacy at launch"
      intro="We collect the details needed to generate a personalized product, process payment, and fulfill delivery."
    >
      <div className="space-y-4">
        <p>
          Customer-provided names, stories, shipping details, and checkout information are used to
          create the personalized game, handle support, and fulfill the order.
        </p>
        <p>
          Payment information is handled by Stripe. Shipping and manufacturing details for physical
          orders are shared with the configured fulfillment provider.
        </p>
        <p>We do not require customer accounts for launch.</p>
      </div>
    </ContentPage>
  );
}
