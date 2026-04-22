import { ContentPage } from "@/components/shared/content-page";

export default function ShippingPolicyPage() {
  return (
    <ContentPage
      eyebrow="Shipping policy"
      title="How production and shipping work"
      intro="GameGift Studio launches as a US-only product with live shipping quotes on physical orders."
    >
      <div className="space-y-4">
        <p>Digital orders deliver after payment and final asset generation.</p>
        <p>
          Physical boxed games collect a shipping quote before checkout. Production timing varies
          by template and carrier method, but the customer sees an estimated production and transit
          window before paying.
        </p>
        <p>
          Tracking updates appear after the manufacturer marks the shipment in transit and are also
          available through guest order lookup.
        </p>
      </div>
    </ContentPage>
  );
}
