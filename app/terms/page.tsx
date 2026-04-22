import { ContentPage } from "@/components/shared/content-page";

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Terms"
      title="Launch terms"
      intro="These terms are intentionally simple for the consumer launch phase."
    >
      <div className="space-y-4">
        <p>
          Customers are responsible for entering accurate personalization and shipping details
          before checkout.
        </p>
        <p>
          GameGift Studio reserves the right to reject requests that infringe protected intellectual
          property, contain hateful content, or otherwise violate product guardrails.
        </p>
        <p>
          Production times, shipping times, and final rendered output may vary slightly from the
          preview, but the personalized structure and approved edits remain the basis for the final
          files.
        </p>
      </div>
    </ContentPage>
  );
}
