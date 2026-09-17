import assert from "node:assert/strict";
import { nextOrderState } from "./order_decision.js";

assert.equal(nextOrderState("I need the receipt for my order"), "receipt");
assert.equal(nextOrderState("The parcel is shipped, send tracking"), "customer_update");
assert.equal(nextOrderState("Items are in my cart"), "checkout");
console.log("order decision tests passed");
