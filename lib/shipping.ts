import { Prisma, ProductTier } from "@prisma/client";

import { db } from "@/lib/db";
import { getShippingQuotes } from "@/lib/fulfillment";
import { buildFulfillmentPlan } from "@/lib/fulfillment/plan";
import { recordOperationalEvent } from "@/lib/operations";
import type { TemplateSlug } from "@/lib/templates/types";
import { shippingSchema } from "@/lib/validation/project";

export async function createShippingQuotesForProject(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.productTier !== ProductTier.printed_board_cards) {
    throw new Error("Shipping quotes are only required for boxed game orders.");
  }

  const shipping = shippingSchema.parse(project.shippingJson);
  const input = project.inputJson as Prisma.JsonObject;
  const customerEmail =
    typeof input.customerEmail === "string" ? input.customerEmail : undefined;
  const fulfillmentPlan = buildFulfillmentPlan({
    templateSlug: project.templateSlug as TemplateSlug,
    productTier: project.productTier,
  });
  const providerQuotes = await getShippingQuotes({
    projectId: project.id,
    templateSlug: project.templateSlug as TemplateSlug,
    productTier: project.productTier,
    shipping,
    email: customerEmail,
    fulfillmentPlan,
  });

  await db.shippingQuote.updateMany({
    where: {
      projectId,
      status: {
        in: ["active", "selected"],
      },
    },
    data: {
      status: "expired",
    },
  });

  const quotes = await Promise.all(
    providerQuotes.quotes.map((quote) =>
      db.shippingQuote.create({
        data: {
          projectId,
          provider: quote.provider,
          status: "active",
          providerCartId: quote.providerCartId,
          shippingMethod: quote.shippingMethod,
          shippingLabel: quote.shippingLabel,
          amount: quote.amount,
          currency: quote.currency,
          handlingAmount: quote.handlingAmount ?? 0,
          insuranceAmount: quote.insuranceAmount ?? 0,
          taxAmount: quote.taxAmount ?? 0,
          weightOz: quote.weightOz,
          parcelCount: quote.parcelCount,
          etaMinBusinessDays: quote.etaMinBusinessDays,
          etaMaxBusinessDays: quote.etaMaxBusinessDays,
          productionMinBusinessDays: quote.productionMinBusinessDays,
          productionMaxBusinessDays: quote.productionMaxBusinessDays,
          estimatedShipDate: quote.estimatedShipDate
            ? new Date(quote.estimatedShipDate)
            : undefined,
          expiresAt: quote.expiresAt ? new Date(quote.expiresAt) : undefined,
          payloadJson: quote.payload as Prisma.InputJsonValue,
        },
      }),
    ),
  );

  await db.project.update({
    where: { id: projectId },
    data: {
      status: "quote_ready",
    },
  });

  await recordOperationalEvent({
    projectId,
    scope: "shipping",
    eventType: "quotes_created",
    message: `${quotes.length} shipping quote(s) created.`,
    metadata: {
      provider: providerQuotes.provider,
    },
  });

  return quotes;
}

export async function expireStaleShippingQuotes() {
  return db.shippingQuote.updateMany({
    where: {
      status: {
        in: ["active", "selected"],
      },
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: "expired",
    },
  });
}
