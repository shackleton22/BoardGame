import { NextResponse } from "next/server";

import { lookupOrderByNumber } from "@/lib/orders";
import { orderLookupSchema } from "@/lib/validation/project";

export const runtime = "nodejs";

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

    return NextResponse.json({ order });
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
