import { getRequiredEnv, getTgcPaymentMethod } from "@/lib/env";
import { compactObject } from "@/lib/utils";

const TGC_BASE_URL = "https://www.thegamecrafter.com/api";

type TgcSession = {
  id: string;
  user_id: string;
};

type TgcUser = {
  id: string;
  root_folder_id: string;
};

type TgcAddress = {
  id: string;
};

type TgcCart = {
  id: string;
  subtotal?: string;
  taxes?: string;
  total?: string;
  shipping_method?: string;
};

type TgcReceipt = {
  id: string;
  order_number?: string | number;
  shipments?: Array<{ id: string }>;
};

type TgcShipment = {
  id: string;
  tracking_number?: string;
  tracking_url_provider?: string;
};

async function parseTgcResponse<T>(response: Response) {
  const payload = (await response.json()) as {
    result?: T;
    error?: { message?: string };
  };

  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || `The Game Crafter request failed with ${response.status}.`);
  }

  return (payload.result ?? payload) as T;
}

async function requestTgc<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT";
    params?: Record<string, string | number | undefined>;
  },
) {
  const method = options.method ?? "GET";
  const params = compactObject(options.params ?? {});

  if (method === "GET") {
    const searchParams = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    );
    const response = await fetch(`${TGC_BASE_URL}${path}?${searchParams.toString()}`);
    return parseTgcResponse<T>(response);
  }

  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await fetch(`${TGC_BASE_URL}${path}`, {
    method,
    body: formData,
  });

  return parseTgcResponse<T>(response);
}

let sessionPromise: Promise<TgcSession> | null = null;

async function getSession() {
  sessionPromise ??= requestTgc<TgcSession>("/session", {
    method: "POST",
    params: {
      username: getRequiredEnv("TGC_USERNAME"),
      password: getRequiredEnv("TGC_PASSWORD"),
      api_key_id: getRequiredEnv("TGC_API_KEY_ID"),
    },
  });

  return sessionPromise;
}

export async function getTheGameCrafterUser() {
  const session = await getSession();
  return requestTgc<TgcUser>(`/user/${session.user_id}`, {
    params: {
      session_id: session.id,
    },
  });
}

export async function createTheGameCrafterAddress(args: {
  userId: string;
  fullName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}) {
  const session = await getSession();
  return requestTgc<TgcAddress>("/address", {
    method: "POST",
    params: {
      session_id: session.id,
      user_id: args.userId,
      name: args.fullName,
      company: args.company,
      address1: args.addressLine1,
      address2: args.addressLine2,
      city: args.city,
      state: args.state,
      postal_code: args.postalCode,
      country: args.country,
      phone_number: args.phoneNumber,
    },
  });
}

export async function createTheGameCrafterCart(name: string) {
  return requestTgc<TgcCart>("/cart", {
    method: "POST",
    params: {
      api_key_id: getRequiredEnv("TGC_API_KEY_ID"),
      name,
    },
  });
}

export async function addSkuToTheGameCrafterCart(args: {
  cartId: string;
  sku: string;
  quantity: number;
}) {
  return requestTgc<TgcCart>(`/cart/${args.cartId}/sku/${args.sku}`, {
    method: "POST",
    params: {
      quantity: args.quantity,
    },
  });
}

export async function updateTheGameCrafterCart(args: {
  cartId: string;
  shippingAddressId?: string;
  shippingMethod?: string;
  notes?: string;
}) {
  const session = await getSession();
  return requestTgc<TgcCart>(`/cart/${args.cartId}`, {
    method: "PUT",
    params: {
      session_id: session.id,
      shipping_address_id: args.shippingAddressId,
      shipping_method: args.shippingMethod,
      notes: args.notes,
    },
  });
}

export async function getTheGameCrafterShippingOptions(cartId: string) {
  return requestTgc<Record<string, Record<string, string | number>>>(
    `/cart/${cartId}/shipping-method-options`,
    {
      params: {},
    },
  );
}

export async function attachUserToTheGameCrafterCart(args: {
  cartId: string;
  email?: string;
  useMerchantSession?: boolean;
}) {
  const session = await getSession();

  return requestTgc<{ session_id?: string; order?: TgcCart }>(`/cart/${args.cartId}/user`, {
    method: "POST",
    params: args.useMerchantSession
      ? {
          session_id: session.id,
        }
      : {
          email: args.email,
        },
  });
}

export async function submitTheGameCrafterCartPayment(cartId: string) {
  const session = await getSession();
  const paymentMethod = getTgcPaymentMethod();

  if (paymentMethod === "invoice") {
    return requestTgc<TgcReceipt>(`/cart/${cartId}/payment/invoice`, {
      method: "POST",
      params: {
        session_id: session.id,
        po_number: `GGS-${Date.now()}`,
      },
    });
  }

  return requestTgc<TgcReceipt>(`/cart/${cartId}/payment/shopcredit`, {
    method: "POST",
    params: {
      session_id: session.id,
    },
  });
}

export async function fetchTheGameCrafterReceipt(receiptId: string) {
  const session = await getSession();
  return requestTgc<TgcReceipt>(`/receipt/${receiptId}`, {
    params: {
      session_id: session.id,
    },
  });
}

export async function cancelTheGameCrafterReceipt(args: {
  receiptId: string;
  reason: string;
}) {
  const session = await getSession();
  return requestTgc<{ success: number }>(`/receipt/${args.receiptId}/cancel`, {
    method: "POST",
    params: {
      session_id: session.id,
      cancel_reason: args.reason,
    },
  });
}

export async function fetchTheGameCrafterShipment(shipmentId: string) {
  const session = await getSession();
  return requestTgc<TgcShipment>(`/shipment/${shipmentId}`, {
    params: {
      session_id: session.id,
    },
  });
}
