import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateAdmin } from "@/lib/admin";

const schema = z.object({
  password: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const success = await authenticateAdmin(body.password);

    if (!success) {
      return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: 400 },
    );
  }
}
