export type OrderState = "checkout" | "fulfillment" | "receipt" | "customer_update";

export function nextOrderState(transcript: string): OrderState {
  const text = transcript.toLowerCase();
  if (text.includes("receipt") || text.includes("invoice")) return "receipt";
  if (text.includes("shipped") || text.includes("delivery") || text.includes("tracking")) return "customer_update";
  if (text.includes("buy") || text.includes("checkout") || text.includes("cart")) return "checkout";
  return "fulfillment";
}
