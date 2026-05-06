import { OrderLookupForm } from "@/components/order/order-lookup-form";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { getLaunchConfig } from "@/lib/launch/config";

export default function OrderLookupPage() {
  const launchConfig = getLaunchConfig();
  const supportEmail = launchConfig.supportEmail;

  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="launch-note">
          <span>Guest order lookup</span>
          <span>Use your receipt email</span>
          <span>Tracking appears here for boxed orders</span>
        </div>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <span className="section-label">Order status</span>
            <h1 className="heading-display text-5xl font-semibold text-stone-950">
              Check your order without creating an account
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">
              The launch checkout is intentionally simple. Your receipt email and order
              number are enough to get back to the latest production or delivery status.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="paper-panel rounded-[1.8rem] p-5">
                <div className="spec-label">You will need</div>
                <div className="mt-4 space-y-2">
                  <div className="spec-line">The order number from your receipt</div>
                  <div className="spec-line">The same email used at checkout</div>
                </div>
              </div>
              <div className="paper-panel rounded-[1.8rem] p-5">
                <div className="spec-label">Need help?</div>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  If you cannot find the receipt, email support and include the recipient
                  name plus your best guess at the purchase date. {launchConfig.supportPromiseCopy}
                </p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-strong)]"
                >
                  {supportEmail}
                </a>
              </div>
            </div>
          </div>

          <div className="paper-panel rounded-[2.2rem] p-6 sm:p-8">
            <OrderLookupForm supportEmail={supportEmail} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
