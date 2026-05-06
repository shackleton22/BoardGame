import { ProductTier } from "@prisma/client";

import { templateHasLiveSkuConfig } from "@/lib/catalog/game-kits";
import { getOptionalEnv, getSupportEmail, hasTheGameCrafterConfig } from "@/lib/env";
import type { TemplateSlug } from "@/lib/templates/types";

export const LAUNCH_TEMPLATE_SLUGS = [
  "home-turf",
  "milestone-trail",
  "face-card",
  "case-file",
  "trivia-trek",
] as const satisfies readonly TemplateSlug[];

const TRUTHY_VALUES = new Set(["1", "true", "yes", "on", "enabled"]);
const FALSY_VALUES = new Set(["0", "false", "no", "off", "disabled"]);

function parseBooleanEnv(name: string, fallback: boolean) {
  const value = getOptionalEnv(name)?.toLowerCase();

  if (!value) {
    return fallback;
  }

  if (TRUTHY_VALUES.has(value)) {
    return true;
  }

  if (FALSY_VALUES.has(value)) {
    return false;
  }

  return fallback;
}

function parseEnabledTemplates() {
  const raw = getOptionalEnv("LAUNCH_ENABLED_TEMPLATES");

  if (!raw) {
    return [...LAUNCH_TEMPLATE_SLUGS];
  }

  const requested = raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);

  return LAUNCH_TEMPLATE_SLUGS.filter((slug) => requested.includes(slug));
}

function hasLiveFulfillmentForTemplates(templateSlugs: TemplateSlug[]) {
  return hasTheGameCrafterConfig() && templateSlugs.every((slug) => templateHasLiveSkuConfig(slug));
}

export function getLaunchConfig() {
  const enabledTemplates = parseEnabledTemplates();
  const physicalCheckoutRequested = parseBooleanEnv("PHYSICAL_CHECKOUT_ENABLED", true);
  const allowMockPhysicalCheckout = parseBooleanEnv(
    "ALLOW_MOCK_PHYSICAL_CHECKOUT",
    process.env.NODE_ENV !== "production",
  );
  const hasLivePhysicalFulfillment = hasLiveFulfillmentForTemplates(enabledTemplates);
  const physicalCheckoutEnabled =
    physicalCheckoutRequested && (allowMockPhysicalCheckout || hasLivePhysicalFulfillment);
  const physicalDisabledMessage =
    getOptionalEnv("PHYSICAL_CHECKOUT_DISABLED_MESSAGE") ??
    (physicalCheckoutRequested && !hasLivePhysicalFulfillment
      ? "Boxed checkout is temporarily paused until live manufacturing credentials and SKU maps are configured."
      : "Boxed checkout is temporarily paused while we review production capacity.");

  return {
    isSoftLaunch: parseBooleanEnv("SOFT_LAUNCH_ENABLED", true),
    enabledTemplates,
    physicalCheckoutEnabled,
    physicalCheckoutRequested,
    allowMockPhysicalCheckout,
    hasLivePhysicalFulfillment,
    supportEmail: getSupportEmail(),
    bannerCopy:
      getOptionalEnv("SOFT_LAUNCH_BANNER_COPY") ??
      "Soft launch: proofs, digital kits, and boxed US orders are open.",
    productionEtaCopy:
      getOptionalEnv("LAUNCH_PRODUCTION_ETA_COPY") ??
      "Boxed games usually enter production within 1 business day after checkout.",
    shippingEtaCopy:
      getOptionalEnv("LAUNCH_SHIPPING_ETA_COPY") ??
      "Live shipping options show production plus transit timing before payment.",
    supportPromiseCopy:
      getOptionalEnv("LAUNCH_SUPPORT_PROMISE_COPY") ??
      "Founder-run email support replies by the next business day during soft launch.",
    physicalDisabledMessage,
  };
}

export function isTemplateLaunchEnabled(slug: string): slug is TemplateSlug {
  return getLaunchConfig().enabledTemplates.includes(slug as TemplateSlug);
}

export function assertTemplateLaunchEnabled(slug: string) {
  if (!isTemplateLaunchEnabled(slug)) {
    throw new Error("This game format is not available during the current launch window.");
  }
}

export function assertProductTierLaunchEnabled(productTier: ProductTier) {
  const launchConfig = getLaunchConfig();

  if (
    productTier === ProductTier.printed_board_cards &&
    !launchConfig.physicalCheckoutEnabled
  ) {
    throw new Error(launchConfig.physicalDisabledMessage);
  }

  if (productTier === ProductTier.premium_gift_box) {
    throw new Error("Premium Gift Box is not available in the launch catalog yet.");
  }
}
