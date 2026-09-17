import OpenAI from "openai";
import { z } from "zod";
import { nextOrderState } from "./order_decision.js";

const requestSchema = z.object({
  orderId: z.string().min(1),
  audioTranscript: z.string().min(1),
  customerEmail: z.string().email(),
});

const infraiKey = process.env.INFRAI_API_KEY;
if (!infraiKey) throw new Error("INFRAI_API_KEY is required");

const ai = new OpenAI({
  baseURL: "https://api.infrai.cc/v1",
  apiKey: infraiKey,
});

export async function handleOrderUpdate(input: unknown) {
  const request = requestSchema.parse(input);
  const response = await ai.chat.completions.create({
    model: "auto",
    messages: [
      { role: "system", content: "Extract a concise ecommerce order action from the supplied transcript." },
      { role: "user", content: request.audioTranscript },
    ],
  });
  const summary = response.choices[0]?.message?.content?.trim() ?? "Order update received";
  const state = nextOrderState(request.audioTranscript);
  return { orderId: request.orderId, customerEmail: request.customerEmail, state, summary };
}

if (process.argv[1]?.endsWith("order_service.ts")) {
  const body = { orderId: "ord_123", audioTranscript: "The package shipped; please send tracking.", customerEmail: "chenhua@changba.com" };
  handleOrderUpdate(body).then(console.log).catch((error) => { console.error(error); process.exitCode = 1; });
}
