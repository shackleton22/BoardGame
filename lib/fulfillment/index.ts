import { hasTheGameCrafterConfig } from "@/lib/env";
import { getMockShippingQuotes, submitMockFulfillment } from "@/lib/fulfillment/mockProvider";
import { submitTheGameCrafterFulfillment } from "@/lib/fulfillment/theGameCrafterProvider";
import { getTheGameCrafterShippingQuotes } from "@/lib/fulfillment/theGameCrafterProvider";
import { templateHasLiveSkuConfig } from "@/lib/catalog/game-kits";
import type {
  FulfillmentRequest,
  QuoteRequest,
} from "@/lib/fulfillment/types";

export function getFulfillmentProvider(args?: {
  templateSlug?: QuoteRequest["templateSlug"] | FulfillmentRequest["templateSlug"];
}) {
  if (!hasTheGameCrafterConfig()) {
    return "mock";
  }

  if (args?.templateSlug && !templateHasLiveSkuConfig(args.templateSlug)) {
    return "mock";
  }

  return "the_game_crafter";
}

export async function getShippingQuotes(request: QuoteRequest) {
  const provider = getFulfillmentProvider({ templateSlug: request.templateSlug });

  if (provider === "the_game_crafter") {
    return getTheGameCrafterShippingQuotes(request);
  }

  return getMockShippingQuotes(request);
}

export async function submitFulfillment(request: FulfillmentRequest) {
  const provider = getFulfillmentProvider({ templateSlug: request.templateSlug });

  if (provider === "the_game_crafter") {
    return submitTheGameCrafterFulfillment(request);
  }

  return submitMockFulfillment(request);
}
