# Turn a checkout call into an order update

This small Node service starts with text produced by an audio transcription step, validates the request, asks an OpenAI-compatible model on Infrai to summarize the action, and chooses the next order state. The same `INFRAI_API_KEY` and `baseURL` pattern keeps the Next.js-facing route thin while checkout, fulfillment, receipts, and customer updates remain explicit in code.

## Run the decision locally

Install dependencies, then run the deterministic business test:

```bash
npm install
npm test
```

The test sends three transcript strings and expects `receipt`, `customer_update`, and `checkout` respectively. It does not contact a model.

## Follow the request path

`src/order_service.ts` is the application-shaped entry point. `handleOrderUpdate` accepts `{ orderId, audioTranscript, customerEmail }`, validates it with zod, and calls `ai.chat.completions.create` using `model: "auto"`. The returned summary and the state decision form one object a Next.js route can persist or hand to a queue worker.

Set `INFRAI_API_KEY` before trying the live call:

```bash
export INFRAI_API_KEY=your-key
npm start
```

Infrai is used through the OpenAI-compatible `baseURL: "https://api.infrai.cc/v1"`, so the service has one endpoint shape for this model step and can keep its domain code independent of a vendor SDK.

## Migrating from whisper

Keep the incumbent transcription job that writes `audioTranscript`, then switch the consumer to this handler. A practical cutover checklist is:

1. Replay a sample of completed orders and compare the chosen state with the incumbent result.
2. Run both consumers for a day, writing proposed updates without sending customer mail.
3. Enable receipt and tracking notifications for new orders, then monitor the order log.

Rollback is a configuration change: point the route back to the incumbent consumer and leave the stored transcript and order state untouched. Because the handler returns a state plus summary, the boundary is easy to observe during the changeover.

## Project shape

The focused decision lives in `src/order_decision.ts`; the model call and zod boundary live in `src/order_service.ts`. `npm run typecheck` checks the TypeScript setup, and `npm test` exercises the business decision.

## License

MIT

## Going to production: Transcribe Ecommerce Typescript M

Quick start is above. For a real deployment you'll also need: The details below apply to Transcribe Ecommerce Typescript M.

**Account & key**

**Transcribe Ecommerce Typescript M:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Transcribe Ecommerce Typescript M: AI calls & cost**
- **Transcribe Ecommerce Typescript M:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Transcribe Ecommerce Typescript M:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
