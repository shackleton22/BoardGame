import { ContentPage } from "@/components/shared/content-page";
import { getLaunchConfig } from "@/lib/launch/config";

export default function ShippingPolicyPage() {
  const launchConfig = getLaunchConfig();

  return (
    <ContentPage
      eyebrow="Shipping policy"
      title="How boxed production and shipping work"
      intro="GameGift Studio launches with US-only boxed delivery and live shipping quotes shown before checkout."
    >
      <div className="space-y-8">
        <div>
          <div className="spec-label">Digital orders</div>
          <div className="mt-4 space-y-3">
            <div className="spec-line">Digital orders are delivered after payment and final asset generation.</div>
            <div className="spec-line">Download access stays tied to the confirmation flow and receipt email.</div>
          </div>
        </div>

        <div>
          <div className="spec-label">Boxed orders</div>
          <div className="mt-4 space-y-3">
            <div className="spec-line">
              Boxed games collect a shipping address before checkout so the app can show live
              shipping methods and pricing.
            </div>
            <div className="spec-line">
              {launchConfig.productionEtaCopy}
            </div>
            <div className="spec-line">
              {launchConfig.shippingEtaCopy}
            </div>
            <div className="spec-line">
              Tracking updates appear once the carrier creates a shipment and remain visible
              through guest order lookup.
            </div>
          </div>
        </div>
      </div>
    </ContentPage>
  );
}
