import { NextResponse } from "next/server";

import { lookupOrderByNumber } from "@/lib/orders";
import { orderLookupSchema } from "@/lib/validation/project";

export const runtime = "nodejs";

function toCustomerOrder(order: NonNullable<Awaited<ReturnType<typeof lookupOrderByNumber>>>) {
  return {
    publicOrderNumber: order.publicOrderNumber,
    status: order.status,
    productTier: order.productTier,
    templateSlug: order.templateSlug,
    amount: order.amount,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    shippingQuote: order.shippingQuote
      ? {
          shippingLabel: order.shippingQuote.shippingLabel,
          amount: order.shippingQuote.amount,
          currency: order.shippingQuote.currency,
          etaMinBusinessDays: order.shippingQuote.etaMinBusinessDays,
          etaMaxBusinessDays: order.shippingQuote.etaMaxBusinessDays,
          productionMinBusinessDays: order.shippingQuote.productionMinBusinessDays,
          productionMaxBusinessDays: order.shippingQuote.productionMaxBusinessDays,
          estimatedShipDate: order.shippingQuote.estimatedShipDate?.toISOString() ?? null,
        }
      : null,
    project: {
      templateSlug: order.project.templateSlug,
      recipientName: order.project.recipientName,
      template: {
        name: order.project.template.name,
      },
      assets: order.project.assets.map((asset) => ({
        type: asset.type,
        label: asset.label,
        url: asset.url,
      })),
    },
    vendorOrder: order.vendorOrder
      ? {
          status: order.vendorOrder.status,
          shipments: order.vendorOrder.shipments.map((shipment) => ({
            status: shipment.status,
            trackingNumber: shipment.trackingNumber,
            trackingUrl: shipment.trackingUrl,
          })),
        }
      : null,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const body = orderLookupSchema.parse({
      orderNumber: url.searchParams.get("orderNumber"),
      email: url.searchParams.get("email"),
    });

    const order = await lookupOrderByNumber(body);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order: toCustomerOrder(order) });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to look up that order.",
      },
      { status: 400 },
    );
  }
}
