import { NextResponse } from "next/server";

import { createShippingQuotesForProject } from "@/lib/shipping";
import { shippingQuoteRequestSchema } from "@/lib/validation/project";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = shippingQuoteRequestSchema.parse(await request.json());
    const quotes = await createShippingQuotesForProject(body.projectId);

    return NextResponse.json({ quotes });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load shipping quotes right now.",
      },
      { status: 400 },
    );
  }
}
