import { addBusinessDays, startOfFutureHours } from "@/lib/utils";

import type {
  FulfillmentRequest,
  FulfillmentResult,
  QuoteRequest,
  QuoteResult,
} from "@/lib/fulfillment/types";

export async function getMockShippingQuotes(request: QuoteRequest): Promise<QuoteResult> {
  const expiresAt = startOfFutureHours(request.fulfillmentPlan.productionWindow.quoteTtlHours);

  return {
    provider: "mock",
    quotes: [
      {
        provider: "mock",
        shippingMethod: "mock-ground",
        shippingLabel: "Mock Ground",
        amount: 1499,
        currency: "usd",
        etaMinBusinessDays: 3,
        etaMaxBusinessDays: 7,
        productionMinBusinessDays: request.fulfillmentPlan.productionWindow.minDays,
        productionMaxBusinessDays: request.fulfillmentPlan.productionWindow.maxDays,
        estimatedShipDate: addBusinessDays(
          new Date(),
          request.fulfillmentPlan.productionWindow.maxDays,
        ).toISOString(),
        expiresAt: expiresAt.toISOString(),
        payload: {
          reason: "The Game Crafter is not configured yet, so this quote is a safe fallback.",
          shipping: request.shipping,
          templateSlug: request.templateSlug,
        },
      },
    ],
    payload: {
      provider: "mock",
      shipping: request.shipping,
      templateSlug: request.templateSlug,
    },
  };
}

export async function submitMockFulfillment(
  request: FulfillmentRequest,
): Promise<FulfillmentResult> {
  return {
    provider: "mock",
    status: request.productTier === "printed_board_cards" ? "manual_review" : "submitted_mock",
    payload: {
      orderId: request.orderId,
      publicOrderNumber: request.publicOrderNumber,
      projectId: request.projectId,
      templateSlug: request.templateSlug,
      recipientName: request.recipientName,
      shipping: request.shipping,
      shippingQuote: request.shippingQuote,
      assets: request.assets,
      fulfillmentPlan: request.fulfillmentPlan,
    },
    response: {
      note: "Mock fulfillment created. Review assets and vendor settings before launch.",
    },
  };
}
