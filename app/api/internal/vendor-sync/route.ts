import { NextResponse } from "next/server";

import { getCronSecret } from "@/lib/env";
import { expireStaleShippingQuotes } from "@/lib/shipping";
import { syncPendingVendorOrders } from "@/lib/vendor-sync";

export const runtime = "nodejs";

function authorize(request: Request) {
  const secret = getCronSecret();

  if (!secret) {
    throw new Error("CRON_SECRET is not configured.");
  }

  const provided =
    request.headers.get("x-cron-secret") ||
    new URL(request.url).searchParams.get("secret");

  if (provided !== secret) {
    throw new Error("Unauthorized.");
  }
}

export async function POST(request: Request) {
  try {
    authorize(request);

    const [vendorResults, expiredQuotes] = await Promise.all([
      syncPendingVendorOrders(),
      expireStaleShippingQuotes(),
    ]);

    return NextResponse.json({
      success: true,
      syncedVendorOrders: vendorResults.length,
      expiredQuotes: expiredQuotes.count,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Vendor sync job failed.",
      },
      { status: 400 },
    );
  }
}
