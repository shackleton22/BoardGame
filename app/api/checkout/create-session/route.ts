import { NextResponse } from "next/server";

import { createCheckoutSession } from "@/lib/orders";
import { checkoutRequestSchema } from "@/lib/validation/project";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = checkoutRequestSchema.parse(await request.json());
    const session = await createCheckoutSession(body);

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create your checkout session right now.",
      },
      { status: 400 },
    );
  }
}
