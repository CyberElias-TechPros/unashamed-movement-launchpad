export interface CartLine {
  price: number;
  quantity: number;
}

export const calcSubtotal = (items: CartLine[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const calcTax = (subtotal: number, rate = 0.08) => subtotal * rate;

export const calcTotal = (subtotal: number, taxRate = 0.08) => {
  const tax = calcTax(subtotal, taxRate);
  return subtotal + tax;
};
