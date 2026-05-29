import { describe, it, expect } from "vitest";
import { calcSubtotal, calcTax, calcTotal } from "@/lib/cart-utils";

describe("cart-utils", () => {
  it("calculates subtotal", () => {
    expect(calcSubtotal([{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }])).toBe(25);
  });

  it("calculates tax and total", () => {
    expect(calcTax(100, 0.08)).toBe(8);
    expect(calcTotal(100, 0.08)).toBe(108);
  });
});
