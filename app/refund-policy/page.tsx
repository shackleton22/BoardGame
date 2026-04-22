import { ContentPage } from "@/components/shared/content-page";

export default function RefundPolicyPage() {
  return (
    <ContentPage
      eyebrow="Refund policy"
      title="Refunds and cancellations"
      intro="Personalized products need a slightly stricter refund policy than commodity merchandise."
    >
      <div className="space-y-4">
        <p>
          Digital orders are generally non-refundable once final assets are generated and made
          available.
        </p>
        <p>
          Physical orders may be cancelled before they enter production. Once a vendor order has
          been submitted or shipped, refunds depend on production status and any confirmed damage or
          defect.
        </p>
        <p>Customers should contact support as quickly as possible with their order number.</p>
      </div>
    </ContentPage>
  );
}
