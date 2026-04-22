import { Prisma, VendorOrderStatus, VendorShipmentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import {
  cancelTheGameCrafterVendorOrder,
  syncTheGameCrafterVendorOrder,
} from "@/lib/fulfillment/theGameCrafterProvider";
import { recordOperationalEvent } from "@/lib/operations";
import { sendTransactionalEmail } from "@/lib/email";

export async function syncVendorOrder(vendorOrderId: string) {
  const vendorOrder = await db.vendorOrder.findUnique({
    where: { id: vendorOrderId },
    include: {
      order: true,
    },
  });

  if (!vendorOrder) {
    throw new Error("Vendor order not found.");
  }

  if (vendorOrder.provider !== "the_game_crafter" || !vendorOrder.providerReceiptId) {
    throw new Error("This vendor order cannot be synced automatically.");
  }

  const result = await syncTheGameCrafterVendorOrder({
    receiptId: vendorOrder.providerReceiptId,
  });

  const nextStatus =
    result.shipment?.status === "in_transit" || result.shipment?.status === "delivered"
      ? VendorOrderStatus.shipped
      : VendorOrderStatus.processing;

  await db.vendorOrder.update({
    where: { id: vendorOrderId },
    data: {
      status: nextStatus,
      responseJson: result.response as Prisma.InputJsonValue,
      syncedAt: new Date(),
    },
  });

  if (result.shipment) {
    await db.vendorShipment.upsert({
      where: {
        id: `${vendorOrderId}-${result.shipment.providerShipmentId ?? "primary"}`,
      },
      update: {
        providerShipmentId: result.shipment.providerShipmentId,
        trackingNumber: result.shipment.trackingNumber,
        trackingUrl: result.shipment.trackingUrl,
        status:
          result.shipment.status === "in_transit"
            ? VendorShipmentStatus.in_transit
            : result.shipment.status === "delivered"
              ? VendorShipmentStatus.delivered
              : result.shipment.status === "failed"
                ? VendorShipmentStatus.failed
                : VendorShipmentStatus.pending,
      },
      create: {
        id: `${vendorOrderId}-${result.shipment.providerShipmentId ?? "primary"}`,
        vendorOrderId,
        providerShipmentId: result.shipment.providerShipmentId,
        trackingNumber: result.shipment.trackingNumber,
        trackingUrl: result.shipment.trackingUrl,
        status:
          result.shipment.status === "in_transit"
            ? VendorShipmentStatus.in_transit
            : result.shipment.status === "delivered"
              ? VendorShipmentStatus.delivered
              : result.shipment.status === "failed"
                ? VendorShipmentStatus.failed
                : VendorShipmentStatus.pending,
      },
    });
  }

  await recordOperationalEvent({
    orderId: vendorOrder.orderId,
    scope: "vendor_sync",
    eventType: "synced",
    message: "Vendor order synced.",
    metadata: {
      provider: vendorOrder.provider,
      trackingNumber: result.shipment?.trackingNumber,
    },
  });

  if (result.shipment?.trackingNumber) {
    await sendTransactionalEmail({
      template: "shipment_update",
      to: vendorOrder.order.email,
      payload: {
        orderNumber: vendorOrder.order.publicOrderNumber,
        trackingUrl: result.shipment.trackingUrl,
      },
    });
  }

  return result;
}

export async function syncPendingVendorOrders() {
  const vendorOrders = await db.vendorOrder.findMany({
    where: {
      provider: "the_game_crafter",
      status: {
        in: ["submitted", "processing"],
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const results = [];

  for (const vendorOrder of vendorOrders) {
    results.push(await syncVendorOrder(vendorOrder.id));
  }

  return results;
}

export async function cancelVendorOrder(vendorOrderId: string) {
  const vendorOrder = await db.vendorOrder.findUnique({
    where: { id: vendorOrderId },
    include: { order: true },
  });

  if (!vendorOrder?.providerReceiptId) {
    throw new Error("Vendor order cannot be cancelled automatically.");
  }

  await cancelTheGameCrafterVendorOrder(vendorOrder.providerReceiptId);

  await db.vendorOrder.update({
    where: { id: vendorOrderId },
    data: {
      status: "cancelled",
    },
  });

  await recordOperationalEvent({
    orderId: vendorOrder.orderId,
    scope: "vendor_order",
    eventType: "cancelled",
    message: "Vendor order cancelled.",
  });

  return vendorOrder;
}
