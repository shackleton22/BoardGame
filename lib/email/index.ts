import { getAppUrl, getEmailFromAddress, getResendApiKey, getSupportEmail } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";

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
  const safeSupportEmail = escapeHtml(supportEmail);
  const safe = (value: string | undefined) => escapeHtml(value ?? "");
  const url = (value: string | undefined) => {
    if (!value) {
      return appUrl;
    }

    try {
      return new URL(value, appUrl).toString();
    } catch {
      return appUrl;
    }
  };

  switch (template) {
    case "preview_created":
      return {
        subject: `Your ${payload.templateName ?? "GameGift Studio"} preview is ready`,
        html: `<p>Your preview is ready.</p><p><a href="${safe(url(payload.previewUrl))}">Open preview</a></p><p>Need help? ${safeSupportEmail}</p>`,
      };
    case "order_confirmation":
      return {
        subject: `Order ${payload.orderNumber ?? ""} confirmed`,
        html: `<p>Thanks for your order${payload.recipientName ? ` for ${safe(payload.recipientName)}` : ""}.</p><p>Your order number is <strong>${safe(payload.orderNumber)}</strong>.</p><p>Need help? ${safeSupportEmail}</p>`,
      };
    case "digital_ready":
      return {
        subject: `Your downloads are ready`,
        html: `<p>Your digital files are ready.</p><p><a href="${safe(url(payload.successUrl))}">Open your order</a></p><p>Need help? ${safeSupportEmail}</p>`,
      };
    case "physical_submitted":
      return {
        subject: `Your custom game is in production`,
        html: `<p>Your boxed game order has been submitted for production.</p><p>Order number: <strong>${safe(payload.orderNumber)}</strong>.</p><p>Need help? ${safeSupportEmail}</p>`,
      };
    case "shipment_update":
      return {
        subject: `Tracking update for order ${payload.orderNumber ?? ""}`,
        html: `<p>Your order has a shipment update.</p><p>${payload.trackingUrl ? `<a href="${safe(url(payload.trackingUrl))}">Track shipment</a>` : ""}</p><p>Need help? ${safeSupportEmail}</p>`,
      };
    case "refund_notice":
      return {
        subject: `Refund update for order ${payload.orderNumber ?? ""}`,
        html: `<p>Your order refund or cancellation has been processed.</p><p>If you have questions, email ${safeSupportEmail}.</p>`,
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
    const response = await fetch("https://api.resend.com/emails", {
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

    if (!response.ok) {
      console.error("Failed to send transactional email.", await response.text());
    }
  } catch (error) {
    console.error("Failed to send transactional email.", error);
  }
}
