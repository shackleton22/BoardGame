import { getAppUrl, getEmailFromAddress, getResendApiKey, getSupportEmail } from "@/lib/env";

type EmailTemplate =
  | "preview_created"
  | "order_confirmation"
  | "digital_ready"
  | "physical_submitted"
  | "shipment_update"
  | "refund_notice";

function buildEmailCopy(template: EmailTemplate, payload: Record<string, string | undefined>) {
  const supportEmail = getSupportEmail();
  const appUrl = getAppUrl();

  switch (template) {
    case "preview_created":
      return {
        subject: `Your ${payload.templateName ?? "GameGift Studio"} preview is ready`,
        html: `<p>Your preview is ready.</p><p><a href="${payload.previewUrl ?? appUrl}">Open preview</a></p><p>Need help? ${supportEmail}</p>`,
      };
    case "order_confirmation":
      return {
        subject: `Order ${payload.orderNumber ?? ""} confirmed`,
        html: `<p>Thanks for your order${payload.recipientName ? ` for ${payload.recipientName}` : ""}.</p><p>Your order number is <strong>${payload.orderNumber ?? ""}</strong>.</p><p>Need help? ${supportEmail}</p>`,
      };
    case "digital_ready":
      return {
        subject: `Your downloads are ready`,
        html: `<p>Your digital files are ready.</p><p><a href="${payload.successUrl ?? appUrl}">Open your order</a></p><p>Need help? ${supportEmail}</p>`,
      };
    case "physical_submitted":
      return {
        subject: `Your custom game is in production`,
        html: `<p>Your boxed game order has been submitted for production.</p><p>Order number: <strong>${payload.orderNumber ?? ""}</strong>.</p><p>Need help? ${supportEmail}</p>`,
      };
    case "shipment_update":
      return {
        subject: `Tracking update for order ${payload.orderNumber ?? ""}`,
        html: `<p>Your order has a shipment update.</p><p>${payload.trackingUrl ? `<a href="${payload.trackingUrl}">Track shipment</a>` : ""}</p><p>Need help? ${supportEmail}</p>`,
      };
    case "refund_notice":
      return {
        subject: `Refund update for order ${payload.orderNumber ?? ""}`,
        html: `<p>Your order refund or cancellation has been processed.</p><p>If you have questions, email ${supportEmail}.</p>`,
      };
  }
}

export async function sendTransactionalEmail(args: {
  template: EmailTemplate;
  to?: string | null;
  payload: Record<string, string | undefined>;
}) {
  const apiKey = getResendApiKey();
  const from = getEmailFromAddress();

  if (!args.to || !apiKey || !from) {
    return;
  }

  const message = buildEmailCopy(args.template, args.payload);

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: message.subject,
        html: message.html,
      }),
    });
  } catch (error) {
    console.error("Failed to send transactional email.", error);
  }
}
