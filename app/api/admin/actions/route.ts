import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/admin";
import { refundOrder } from "@/lib/orders";
import { createManualFulfillment, ensureFinalAssets } from "@/lib/projects";
import { expireStaleShippingQuotes } from "@/lib/shipping";
import { cancelVendorOrder, syncVendorOrder } from "@/lib/vendor-sync";

const schema = z.object({
  action: z.enum([
    "generate_assets",
    "mock_fulfill",
    "sync_vendor",
    "refund_order",
    "cancel_vendor_order",
    "expire_quotes",
  ]),
  targetId: z.string().cuid().optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());

    if (body.action === "generate_assets") {
      if (!body.targetId) {
        throw new Error("Missing target ID.");
      }
      await ensureFinalAssets(body.targetId);
    } else if (body.action === "mock_fulfill") {
      if (!body.targetId) {
        throw new Error("Missing target ID.");
      }
      await createManualFulfillment(body.targetId);
    } else if (body.action === "sync_vendor") {
      if (!body.targetId) {
        throw new Error("Missing target ID.");
      }
      await syncVendorOrder(body.targetId);
    } else if (body.action === "refund_order") {
      if (!body.targetId) {
        throw new Error("Missing target ID.");
      }
      await refundOrder(body.targetId);
    } else if (body.action === "cancel_vendor_order") {
      if (!body.targetId) {
        throw new Error("Missing target ID.");
      }
      await cancelVendorOrder(body.targetId);
    } else {
      await expireStaleShippingQuotes();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Admin action failed.",
      },
      { status: 400 },
    );
  }
}
