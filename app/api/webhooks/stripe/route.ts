import { NextResponse } from "next/server";
import Stripe from "stripe";

import { processCompletedCheckoutSession, getStripeWebhookEvent } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature header." },
      { status: 400 },
    );
  }

  try {
    const body = await request.text();
    const event = await getStripeWebhookEvent(body, signature);

    if (event.type === "checkout.session.completed") {
      await processCompletedCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Webhook processing failed.",
      },
      { status: 400 },
    );
  }
}
