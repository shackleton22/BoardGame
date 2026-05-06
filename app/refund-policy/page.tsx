import { ContentPage } from "@/components/shared/content-page";

export default function RefundPolicyPage() {
  return (
    <ContentPage
      eyebrow="Refund policy"
      title="Refunds and cancellations"
      intro="Because every order is personalized, refunds and cancellations work a little differently than they do for off-the-shelf products."
    >
      <div className="space-y-8">
        <div>
          <div className="spec-label">Digital orders</div>
          <div className="mt-4 space-y-3">
            <div className="spec-line">
              Digital orders are generally non-refundable once the final files have been generated
              and made available for delivery.
            </div>
          </div>
        </div>

        <div>
          <div className="spec-label">Boxed orders</div>
          <div className="mt-4 space-y-3">
            <div className="spec-line">
              Boxed orders may be cancelled before they enter production.
            </div>
            <div className="spec-line">
              Once production or shipment has started, refunds depend on the manufacturing stage and
              any confirmed damage or defect.
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--line)] bg-white px-5 py-5 text-sm leading-7 text-stone-600">
          Contact support as quickly as possible if something has gone wrong and include your order
          number so we can review the status.
        </div>
      </div>
    </ContentPage>
  );
}
