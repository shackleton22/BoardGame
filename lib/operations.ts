import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export async function recordOperationalEvent(args: {
  scope: string;
  eventType: string;
  message: string;
  projectId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}) {
  return db.operationalEvent.create({
    data: {
      scope: args.scope,
      eventType: args.eventType,
      message: args.message,
      projectId: args.projectId,
      orderId: args.orderId,
      metadataJson: args.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
