import { ContentPage } from "@/components/shared/content-page";
import { getSupportEmail } from "@/lib/env";

export default function ContactSupportPage() {
  const supportEmail = getSupportEmail();

  return (
    <ContentPage
      eyebrow="Support"
      title="Email-only support for the launch window"
      intro="We keep support lightweight at launch so response quality stays high."
    >
      <div className="space-y-4">
        <p>
          For order questions, shipping updates, or customization issues, email{" "}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--brand-strong)]">
            {supportEmail}
          </a>
          .
        </p>
        <p>Include your order number if you already purchased.</p>
      </div>
    </ContentPage>
  );
}
