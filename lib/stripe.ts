import Stripe from "stripe";

import { getRequiredEnv } from "@/lib/env";

let stripeInstance: Stripe | null = null;

export function getStripeServer() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"));
  }

  return stripeInstance;
}
