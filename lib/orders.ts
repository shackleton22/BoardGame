import {
  FulfillmentStatus,
  OrderStatus,
  Prisma,
  ProductTier,
  ProjectStatus,
  VendorOrderStatus,
} from "@prisma/client";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/env";
import { submitFulfillment } from "@/lib/fulfillment";
import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import { getTemplateTierDetails, type TemplateSlug } from "@/lib/templates/registry";
import { createFulfillmentManifest } from "@/lib/render/fulfillmentManifest";
import { generateFinalAssets } from "@/lib/render/assets";
import { recordOperationalEvent } from "@/lib/operations";
import { buildPublicOrderNumber, formatDate } from "@/lib/utils";
import { getStripeServer } from "@/lib/stripe";

function getOrderLineItems(args: {
  templateName: string;
  productLabel: string;
  productAmount: number;
  shippingAmount?: number;
}) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: args.productAmount,
        product_data: {
          name: args.productLabel,
          description: `Custom ${args.templateName} from GameGift Studio`,
        },
      },
    },
  ];

  if (args.shippingAmount) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: args.shippingAmount,
        product_data: {
          name: "Shipping",
          description: "Frozen shipping quote for the boxed game order",
        },
      },
    });
  }

  return lineItems;
}

export async function createCheckoutSession(args: {
  projectId: string;
  email?: string;
  shippingQuoteId?: string;
}) {
  const project = await db.project.findUnique({
    where: { id: args.projectId },
    include: {
      template: true,
      shippingQuotes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  const tier = getTemplateTierDetails(
    project.templateSlug as TemplateSlug,
    project.productTier,
  );

  if (!tier || !tier.enabled) {
    throw new Error("This product tier is not currently purchasable.");
  }

  let shippingQuote = null;

  if (project.productTier === ProductTier.printed_board_cards) {
    if (!args.shippingQuoteId) {
      throw new Error("Please select a shipping option before checkout.");
    }

    shippingQuote = await db.shippingQuote.findFirst({
      where: {
        id: args.shippingQuoteId,
        projectId: project.id,
      },
    });

    if (!shippingQuote) {
      throw new Error("Selected shipping quote not found.");
    }

    if (shippingQuote.expiresAt && shippingQuote.expiresAt < new Date()) {
      throw new Error("That shipping quote has expired. Please refresh your shipping options.");
    }

    await db.shippingQuote.update({
      where: { id: shippingQuote.id },
      data: {
        status: "selected",
        selectedAt: new Date(),
      },
    });
  }

  const order = await db.order.create({
    data: {
      publicOrderNumber: buildPublicOrderNumber(),
      projectId: project.id,
      shippingQuoteId: shippingQuote?.id,
      email: args.email || undefined,
      amount: tier.amount + (shippingQuote?.amount ?? 0),
      currency: "usd",
      productTier: project.productTier,
      templateSlug: project.templateSlug,
      status: OrderStatus.pending,
      metadataJson: {
        productAmount: tier.amount,
        shippingAmount: shippingQuote?.amount ?? 0,
        shippingQuoteId: shippingQuote?.id,
      },
    },
  });

  const stripe = getStripeServer();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    customer_email: args.email || undefined,
    customer_creation: "always",
    billing_address_collection: "required",
    automatic_tax: {
      enabled: true,
    },
    shipping_address_collection:
      project.productTier === ProductTier.printed_board_cards
        ? {
            allowed_countries: ["US"],
          }
        : undefined,
    success_url: `${getAppUrl()}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getAppUrl()}/preview/${project.id}`,
    metadata: {
      projectId: project.id,
      orderNumber: order.publicOrderNumber,
      templateSlug: project.templateSlug,
      productTier: project.productTier,
      customerEmail: args.email ?? "",
      shippingQuoteId: shippingQuote?.id ?? "",
    },
    line_items: getOrderLineItems({
      templateName: project.template.name,
      productLabel: tier.label,
      productAmount: tier.amount,
      shippingAmount: shippingQuote?.amount ?? undefined,
    }),
  });

  await db.order.update({
    where: { id: order.id },
    data: {
      stripeSessionId: session.id,
    },
  });

  await recordOperationalEvent({
    projectId: project.id,
    orderId: order.id,
    scope: "checkout",
    eventType: "session_created",
    message: "Stripe Checkout session created.",
    metadata: {
      stripeSessionId: session.id,
      shippingQuoteId: shippingQuote?.id,
    },
  });

  return {
    orderId: order.id,
    orderNumber: order.publicOrderNumber,
    sessionId: session.id,
    url: session.url,
  };
}

export async function findOrderForSuccessPage(sessionId?: string | null) {
  if (!sessionId) {
    return null;
  }

  const existingOrder = await db.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      shippingQuote: true,
      project: {
        include: { assets: { orderBy: { createdAt: "asc" } } },
      },
      vendorOrder: {
        include: {
          shipments: { orderBy: { createdAt: "desc" } },
        },
      },
      fulfillmentJobs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (existingOrder) {
    return existingOrder;
  }

  const stripe = getStripeServer();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session.client_reference_id) {
    return null;
  }

  return db.order.findUnique({
    where: { id: session.client_reference_id },
    include: {
      shippingQuote: true,
      project: {
        include: { assets: { orderBy: { createdAt: "asc" } } },
      },
      vendorOrder: {
        include: {
          shipments: { orderBy: { createdAt: "desc" } },
        },
      },
      fulfillmentJobs: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function lookupOrderByNumber(args: { orderNumber: string; email: string }) {
  return db.order.findFirst({
    where: {
      publicOrderNumber: args.orderNumber,
      email: {
        equals: args.email,
        mode: "insensitive",
      },
    },
    include: {
      shippingQuote: true,
      project: {
        include: { assets: { orderBy: { createdAt: "asc" } } },
      },
      vendorOrder: {
        include: {
          shipments: { orderBy: { createdAt: "desc" } },
        },
      },
      fulfillmentJobs: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function processCompletedCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  if (!session.client_reference_id) {
    throw new Error("Checkout session missing client reference ID.");
  }

  const existing = await db.order.findUnique({
    where: { id: session.client_reference_id },
    include: {
      shippingQuote: true,
      project: {
        include: {
          assets: true,
        },
      },
      fulfillmentJobs: true,
      vendorOrder: {
        include: {
          shipments: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error("Order not found for checkout session.");
  }

  if (existing.status === OrderStatus.paid) {
    return existing;
  }

  const updatedOrder = await db.order.update({
    where: { id: existing.id },
    data: {
      status: OrderStatus.paid,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : undefined,
      email:
        session.customer_details?.email ||
        existing.email ||
        session.metadata?.customerEmail ||
        undefined,
    },
    include: {
      shippingQuote: true,
      project: {
        include: {
          assets: true,
        },
      },
      fulfillmentJobs: true,
      vendorOrder: {
        include: {
          shipments: true,
        },
      },
    },
  });

  await db.project.update({
    where: { id: updatedOrder.projectId },
    data: { status: ProjectStatus.paid },
  });

  await recordOperationalEvent({
    projectId: updatedOrder.projectId,
    orderId: updatedOrder.id,
    scope: "order",
    eventType: "paid",
    message: "Stripe Checkout payment completed.",
    metadata: {
      stripeSessionId: session.id,
    },
  });

  const finalAssets = await generateFinalAssets(updatedOrder.project);
  const fulfillmentPlan = buildFulfillmentPlan({
    templateSlug: updatedOrder.templateSlug as TemplateSlug,
    productTier: updatedOrder.productTier,
  });
  const fulfillmentManifest = await createFulfillmentManifest({
    projectId: updatedOrder.projectId,
    templateSlug: updatedOrder.templateSlug,
    recipientName: updatedOrder.project.recipientName,
    orderNumber: updatedOrder.publicOrderNumber,
    plan: fulfillmentPlan,
    assetUrls: {
      boardPdfUrl:
        finalAssets.find((asset) => asset.type === "board_final_pdf")?.url ?? undefined,
      boardPngUrl:
        finalAssets.find((asset) => asset.type === "board_final_png")?.url ?? undefined,
      deckPrimaryPdfUrl:
        finalAssets.find((asset) => asset.type === "deck_primary_pdf")?.url ?? undefined,
      deckSecondaryPdfUrl:
        finalAssets.find((asset) => asset.type === "deck_secondary_pdf")?.url ?? undefined,
      rulesPdfUrl:
        finalAssets.find((asset) => asset.type === "rules_pdf")?.url ?? undefined,
    },
  });

  await sendTransactionalEmail({
    template: "order_confirmation",
    to: updatedOrder.email,
    payload: {
      orderNumber: updatedOrder.publicOrderNumber,
      recipientName: updatedOrder.project.recipientName,
    },
  });

  if (updatedOrder.productTier === ProductTier.digital_print_kit) {
    await db.project.update({
      where: { id: updatedOrder.projectId },
      data: { status: ProjectStatus.asset_ready },
    });

    await sendTransactionalEmail({
      template: "digital_ready",
      to: updatedOrder.email,
      payload: {
        orderNumber: updatedOrder.publicOrderNumber,
        successUrl: `${getAppUrl()}/order/success?session_id=${session.id}`,
      },
    });

    return updatedOrder;
  }

  if (updatedOrder.vendorOrder) {
    return updatedOrder;
  }

  const result = await submitFulfillment({
    orderId: updatedOrder.id,
    publicOrderNumber: updatedOrder.publicOrderNumber,
    projectId: updatedOrder.projectId,
    recipientName: updatedOrder.project.recipientName,
    productTier: updatedOrder.productTier,
    templateSlug: updatedOrder.templateSlug as TemplateSlug,
    shipping:
      (updatedOrder.project.shippingJson as Prisma.JsonObject | null) as never,
    shippingQuote: updatedOrder.shippingQuote
      ? {
          providerCartId: updatedOrder.shippingQuote.providerCartId ?? undefined,
          shippingMethod: updatedOrder.shippingQuote.shippingMethod,
          shippingLabel: updatedOrder.shippingQuote.shippingLabel,
          amount: updatedOrder.shippingQuote.amount,
          currency: updatedOrder.shippingQuote.currency,
          payload:
            (updatedOrder.shippingQuote.payloadJson as Record<string, unknown>) ?? {},
        }
      : null,
    email: updatedOrder.email ?? undefined,
    assets: {
      boardPdfUrl:
        finalAssets.find((asset) => asset.type === "board_final_pdf")?.url ?? undefined,
      boardPngUrl:
        finalAssets.find((asset) => asset.type === "board_final_png")?.url ?? undefined,
      deckPrimaryPdfUrl:
        finalAssets.find((asset) => asset.type === "deck_primary_pdf")?.url ?? undefined,
      deckSecondaryPdfUrl:
        finalAssets.find((asset) => asset.type === "deck_secondary_pdf")?.url ?? undefined,
      rulesPdfUrl:
        finalAssets.find((asset) => asset.type === "rules_pdf")?.url ?? undefined,
      fulfillmentManifestUrl: fulfillmentManifest.publicUrl,
    },
    fulfillmentPlan,
  });

  await db.fulfillmentJob.create({
    data: {
      orderId: updatedOrder.id,
      provider: result.provider,
      providerOrderId: result.providerOrderId,
      status: result.status as FulfillmentStatus,
      payloadJson: result.payload as Prisma.InputJsonValue,
      responseJson: result.response as Prisma.InputJsonValue | undefined,
    },
  });

  await db.vendorOrder.create({
    data: {
      orderId: updatedOrder.id,
      provider: result.provider,
      status:
        result.status === "manual_review"
          ? VendorOrderStatus.manual_review
          : VendorOrderStatus.submitted,
      providerCartId: result.providerCartId,
      providerReceiptId: result.providerReceiptId,
      providerOrderNumber: result.providerOrderId,
      payloadJson: result.payload as Prisma.InputJsonValue,
      responseJson: result.response as Prisma.InputJsonValue | undefined,
      submittedAt: new Date(),
    },
  });

  await db.project.update({
    where: { id: updatedOrder.projectId },
    data: {
      status:
        result.status === "manual_review"
          ? ProjectStatus.asset_ready
          : ProjectStatus.fulfilled,
    },
  });

  await sendTransactionalEmail({
    template: "physical_submitted",
    to: updatedOrder.email,
    payload: {
      orderNumber: updatedOrder.publicOrderNumber,
      estimatedShipDate:
        formatDate(updatedOrder.shippingQuote?.estimatedShipDate) ?? undefined,
    },
  });

  await recordOperationalEvent({
    projectId: updatedOrder.projectId,
    orderId: updatedOrder.id,
    scope: "fulfillment",
    eventType: "submitted",
    message:
      result.status === "manual_review"
        ? "Physical order requires manual vendor review."
        : "Physical order submitted to vendor.",
    metadata: {
      provider: result.provider,
      providerOrderId: result.providerOrderId,
      providerReceiptId: result.providerReceiptId,
    },
  });

  return updatedOrder;
}

export async function refundOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (!order.stripePaymentIntentId) {
    throw new Error("This order does not have a Stripe payment intent to refund.");
  }

  const stripe = getStripeServer();
  await stripe.refunds.create({
    payment_intent: order.stripePaymentIntentId,
  });

  await db.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.refunded,
    },
  });

  await sendTransactionalEmail({
    template: "refund_notice",
    to: order.email,
    payload: {
      orderNumber: order.publicOrderNumber,
    },
  });

  return order;
}

export async function getStripeWebhookEvent(rawBody: string, signature: string) {
  const stripe = getStripeServer();
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET ?? "",
  );
}
