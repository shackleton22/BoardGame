import { OrderLookupForm } from "@/components/order/order-lookup-form";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";

export default function OrderLookupPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell flex-1 py-16">
        <div className="max-w-3xl">
          <span className="section-label">Guest order lookup</span>
          <h1 className="heading-display mt-5 text-5xl font-semibold text-stone-950">
            Check your order status without an account
          </h1>
          <p className="mt-4 text-lg leading-8 text-stone-600">
            Enter your order number and checkout email to view the latest delivery status.
          </p>
        </div>
        <div className="mt-10 max-w-3xl glass-panel rounded-[2rem] p-8">
          <OrderLookupForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
