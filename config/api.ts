// Flag para alternar entre mock y API real
export const API_CONFIG = {
  useMockServices: process.env.NODE_ENV === "development", // o true forzado
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  mockDelay: 800, // Simula latencia de red
} as const;

export const ENDPOINTS = {
  // Auth
  CONNECT: "/auth/connect",
  PROFILE: "/auth/profile",

  // Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
  AVAILABLE_ORDERS: "/orders/available",
  TAKE_ORDER: (id: string) => `/orders/${id}/take`,
  UPLOAD_PROOF: (id: string) => `/orders/${id}/proof`,

  // Quotes
  QUOTE: "/quote",
} as const;
