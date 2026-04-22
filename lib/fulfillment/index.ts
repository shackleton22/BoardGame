import { hasTheGameCrafterConfig } from "@/lib/env";
import { getMockShippingQuotes, submitMockFulfillment } from "@/lib/fulfillment/mockProvider";
import { submitTheGameCrafterFulfillment } from "@/lib/fulfillment/theGameCrafterProvider";
import { getTheGameCrafterShippingQuotes } from "@/lib/fulfillment/theGameCrafterProvider";
import type {
  FulfillmentRequest,
  QuoteRequest,
} from "@/lib/fulfillment/types";

export function getFulfillmentProvider() {
  return hasTheGameCrafterConfig() ? "the_game_crafter" : "mock";
}

export async function getShippingQuotes(request: QuoteRequest) {
  const provider = getFulfillmentProvider();

  if (provider === "the_game_crafter") {
    return getTheGameCrafterShippingQuotes(request);
  }

  return getMockShippingQuotes(request);
}

export async function submitFulfillment(request: FulfillmentRequest) {
  const provider = getFulfillmentProvider();

  if (provider === "the_game_crafter") {
    return submitTheGameCrafterFulfillment(request);
  }

  return submitMockFulfillment(request);
}
