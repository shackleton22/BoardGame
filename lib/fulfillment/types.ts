import { ProductTier } from "@prisma/client";

import type { FulfillmentPlan } from "@/lib/fulfillment/plan";
import type { TemplateSlug } from "@/lib/templates/types";

export type ShippingAddress = {
  fullName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
};

export type QuoteRequest = {
  projectId: string;
  templateSlug: TemplateSlug;
  productTier: ProductTier;
  shipping: ShippingAddress;
  email?: string;
  fulfillmentPlan: FulfillmentPlan;
};

export type QuoteOption = {
  provider: "mock" | "the_game_crafter" | "boardgamesmaker" | "printify";
  providerCartId?: string;
  shippingMethod: string;
  shippingLabel: string;
  amount: number;
  currency: string;
  handlingAmount?: number;
  insuranceAmount?: number;
  taxAmount?: number;
  weightOz?: number;
  parcelCount?: number;
  etaMinBusinessDays?: number;
  etaMaxBusinessDays?: number;
  productionMinBusinessDays?: number;
  productionMaxBusinessDays?: number;
  estimatedShipDate?: string;
  expiresAt?: string;
  payload: Record<string, unknown>;
};

export type QuoteResult = {
  provider: QuoteOption["provider"];
  quotes: QuoteOption[];
  payload: Record<string, unknown>;
};

export type FulfillmentRequest = {
  orderId: string;
  publicOrderNumber: string;
  projectId: string;
  recipientName: string;
  productTier: ProductTier;
  templateSlug: TemplateSlug;
  shipping: ShippingAddress | null;
  shippingQuote: {
    providerCartId?: string;
    shippingMethod: string;
    shippingLabel: string;
    amount: number;
    currency: string;
    payload: Record<string, unknown>;
  } | null;
  email?: string;
  assets: {
    boardPdfUrl?: string;
    boardPngUrl?: string;
    deckPrimaryPdfUrl?: string;
    deckSecondaryPdfUrl?: string;
    rulesPdfUrl?: string;
    fulfillmentManifestUrl?: string;
  };
  fulfillmentPlan: FulfillmentPlan;
};

export type FulfillmentResult = {
  provider: "mock" | "printify" | "boardgamesmaker" | "the_game_crafter";
  status:
    | "submitted"
    | "manual_review"
    | "submitted_mock"
    | "processing"
    | "shipped"
    | "failed";
  providerOrderId?: string;
  providerCartId?: string;
  providerReceiptId?: string;
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
};

export type VendorSyncResult = {
  provider: "the_game_crafter";
  response: Record<string, unknown>;
  shipment?: {
    providerShipmentId?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    status: "pending" | "in_transit" | "delivered" | "failed";
  };
};
