import { ProductTier } from "@prisma/client";

import { syncCatalogData } from "@/lib/catalog/sync";
import { db } from "@/lib/db";
import {
  addSkuToTheGameCrafterCart,
  attachUserToTheGameCrafterCart,
  cancelTheGameCrafterReceipt,
  createTheGameCrafterAddress,
  createTheGameCrafterCart,
  fetchTheGameCrafterReceipt,
  fetchTheGameCrafterShipment,
  getTheGameCrafterShippingOptions,
  getTheGameCrafterUser,
  submitTheGameCrafterCartPayment,
  updateTheGameCrafterCart,
} from "@/lib/fulfillment/theGameCrafterClient";
import type {
  FulfillmentRequest,
  FulfillmentResult,
  QuoteRequest,
  QuoteResult,
  VendorSyncResult,
} from "@/lib/fulfillment/types";
import { addBusinessDays, dollarsToCents, startOfFutureHours } from "@/lib/utils";

function isMissingSku(value: string) {
  return value.startsWith("MISSING_");
}

function mapShippingTransit(method: string) {
  const lower = method.toLowerCase();

  if (lower.includes("ground")) {
    return { min: 2, max: 6 };
  }

  if (lower.includes("priority")) {
    return { min: 2, max: 4 };
  }

  if (lower.includes("express")) {
    return { min: 1, max: 3 };
  }

  return { min: 3, max: 7 };
}

async function getSkuMaps(templateSlug: string, productTier: ProductTier) {
  await syncCatalogData();

  const template = await db.gameTemplate.findUnique({
    where: { slug: templateSlug },
    include: {
      vendorSkuMaps: {
        where: {
          provider: "the_game_crafter",
          productTier,
          active: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!template) {
    throw new Error(`Template ${templateSlug} is not registered.`);
  }

  const validMaps = template.vendorSkuMaps.filter((entry) => !isMissingSku(entry.sku));

  if (!validMaps.length) {
    throw new Error(
      `Live The Game Crafter SKUs are missing for ${templateSlug}. Set the TGC template SKU env vars first.`,
    );
  }

  return validMaps;
}

async function seedCartWithTemplateSku(args: {
  cartId: string;
  templateSlug: string;
  productTier: ProductTier;
}) {
  const skuMaps = await getSkuMaps(args.templateSlug, args.productTier);

  for (const skuMap of skuMaps) {
    await addSkuToTheGameCrafterCart({
      cartId: args.cartId,
      sku: skuMap.sku,
      quantity: skuMap.quantity,
    });
  }

  return skuMaps;
}

export async function getTheGameCrafterShippingQuotes(
  request: QuoteRequest,
): Promise<QuoteResult> {
  const merchantUser = await getTheGameCrafterUser();
  const address = await createTheGameCrafterAddress({
    userId: merchantUser.id,
    fullName: request.shipping.fullName,
    company: request.shipping.company,
    addressLine1: request.shipping.addressLine1,
    addressLine2: request.shipping.addressLine2,
    city: request.shipping.city,
    state: request.shipping.state,
    postalCode: request.shipping.postalCode,
    country: request.shipping.country,
    phoneNumber: request.shipping.phoneNumber,
  });
  const cart = await createTheGameCrafterCart(
    `${request.templateSlug}-${request.projectId}-quote`,
  );
  const skuMaps = await seedCartWithTemplateSku({
    cartId: cart.id,
    templateSlug: request.templateSlug,
    productTier: request.productTier,
  });

  await updateTheGameCrafterCart({
    cartId: cart.id,
    shippingAddressId: address.id,
    notes: `GameGift Studio quote for ${request.projectId}`,
  });

  const options = await getTheGameCrafterShippingOptions(cart.id);
  const expiresAt = startOfFutureHours(request.fulfillmentPlan.productionWindow.quoteTtlHours);

  const quotes = Object.entries(options)
    .filter(([method]) => !method.toLowerCase().includes("will call"))
    .map(([method, details]) => {
      const transit = mapShippingTransit(method);
      return {
        provider: "the_game_crafter" as const,
        providerCartId: cart.id,
        shippingMethod: method,
        shippingLabel: method,
        amount:
          dollarsToCents(details.cost ?? 0) + dollarsToCents(details.handling_fee ?? 0),
        currency: "usd",
        handlingAmount: dollarsToCents(details.handling_fee ?? 0),
        insuranceAmount: 0,
        taxAmount: dollarsToCents(cart.taxes ?? 0),
        weightOz: Number(details.weight ?? 0) || undefined,
        parcelCount: Number(details.number_of_parcels ?? 0) || undefined,
        etaMinBusinessDays: transit.min,
        etaMaxBusinessDays: transit.max,
        productionMinBusinessDays: request.fulfillmentPlan.productionWindow.minDays,
        productionMaxBusinessDays: request.fulfillmentPlan.productionWindow.maxDays,
        estimatedShipDate: addBusinessDays(
          new Date(),
          request.fulfillmentPlan.productionWindow.maxDays,
        ).toISOString(),
        expiresAt: expiresAt.toISOString(),
        payload: {
          addressId: address.id,
          skuMaps: skuMaps.map((entry) => ({
            componentKey: entry.componentKey,
            sku: entry.sku,
            quantity: entry.quantity,
          })),
          rawDetails: details,
        },
      };
    })
    .sort((a, b) => a.amount - b.amount);

  return {
    provider: "the_game_crafter",
    quotes,
    payload: {
      cartId: cart.id,
      addressId: address.id,
      skuMaps: skuMaps.map((entry) => ({
        componentKey: entry.componentKey,
        sku: entry.sku,
        quantity: entry.quantity,
      })),
    },
  };
}

export async function submitTheGameCrafterFulfillment(
  request: FulfillmentRequest,
): Promise<FulfillmentResult> {
  if (!request.shipping || !request.shippingQuote) {
    throw new Error("Physical fulfillment requires a shipping address and shipping quote.");
  }

  const cartId =
    request.shippingQuote.providerCartId ||
    (
      await createTheGameCrafterCart(
        `${request.templateSlug}-${request.publicOrderNumber}`,
      )
    ).id;

  const quotePayload = request.shippingQuote.payload as { addressId?: string };
  let addressId = quotePayload.addressId;

  if (!request.shippingQuote.providerCartId) {
    const merchantUser = await getTheGameCrafterUser();
    const address = await createTheGameCrafterAddress({
      userId: merchantUser.id,
      fullName: request.shipping.fullName,
      company: request.shipping.company,
      addressLine1: request.shipping.addressLine1,
      addressLine2: request.shipping.addressLine2,
      city: request.shipping.city,
      state: request.shipping.state,
      postalCode: request.shipping.postalCode,
      country: request.shipping.country,
      phoneNumber: request.shipping.phoneNumber,
    });
    addressId = address.id;
    await seedCartWithTemplateSku({
      cartId,
      templateSlug: request.templateSlug,
      productTier: request.productTier,
    });
  }

  await updateTheGameCrafterCart({
    cartId,
    shippingAddressId: addressId,
    shippingMethod: request.shippingQuote.shippingMethod,
    notes: [
      `GameGift Studio order ${request.publicOrderNumber}`,
      request.email ? `Customer email: ${request.email}` : undefined,
      request.assets.fulfillmentManifestUrl
        ? `Fulfillment manifest: ${request.assets.fulfillmentManifestUrl}`
        : undefined,
      request.assets.boardPdfUrl ? `Board PDF: ${request.assets.boardPdfUrl}` : undefined,
      request.assets.deckPrimaryPdfUrl
        ? `Primary deck PDF: ${request.assets.deckPrimaryPdfUrl}`
        : undefined,
      request.assets.deckSecondaryPdfUrl
        ? `Secondary deck PDF: ${request.assets.deckSecondaryPdfUrl}`
        : undefined,
      request.assets.rulesPdfUrl ? `Rules PDF: ${request.assets.rulesPdfUrl}` : undefined,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  await attachUserToTheGameCrafterCart({
    cartId,
    useMerchantSession: true,
  });

  const receipt = await submitTheGameCrafterCartPayment(cartId);

  return {
    provider: "the_game_crafter",
    status: "submitted",
    providerOrderId: receipt.order_number ? String(receipt.order_number) : receipt.id,
    providerCartId: cartId,
    providerReceiptId: receipt.id,
    payload: {
      cartId,
      receiptId: receipt.id,
      shippingMethod: request.shippingQuote.shippingMethod,
      shipping: request.shipping,
      assets: request.assets,
      publicOrderNumber: request.publicOrderNumber,
    },
    response: receipt as Record<string, unknown>,
  };
}

export async function syncTheGameCrafterVendorOrder(args: {
  receiptId: string;
}): Promise<VendorSyncResult> {
  const receipt = await fetchTheGameCrafterReceipt(args.receiptId);
  const shipmentSummary = receipt.shipments?.[0];

  if (!shipmentSummary?.id) {
    return {
      provider: "the_game_crafter",
      response: receipt as Record<string, unknown>,
      shipment: {
        status: "pending",
      },
    };
  }

  const shipment = await fetchTheGameCrafterShipment(shipmentSummary.id);

  return {
    provider: "the_game_crafter",
    response: {
      receipt,
      shipment,
    },
    shipment: {
      providerShipmentId: shipment.id,
      trackingNumber: shipment.tracking_number,
      trackingUrl: shipment.tracking_url_provider,
      status: shipment.tracking_number ? "in_transit" : "pending",
    },
  };
}

export async function cancelTheGameCrafterVendorOrder(receiptId: string) {
  return cancelTheGameCrafterReceipt({
    receiptId,
    reason: "Customer requested cancellation before production began.",
  });
}
