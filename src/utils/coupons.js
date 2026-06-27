export const COUPONS = {
  FIRST50: { discount: 0.5, maxOff: 314, label: '50% off up to ₹314' },
  SAVE20: { discount: 0.2, maxOff: 100, label: '20% off up to ₹100' },
  QB180: { discount: 0, flat: 180, label: '₹180 flat off' },
}

export function getCouponDiscount(cartTotal, couponCode) {
  if (!couponCode || !COUPONS[couponCode]) return 0
  const c = COUPONS[couponCode]
  if (c.flat) return Math.min(c.flat, cartTotal)
  return Math.min(Math.round(cartTotal * c.discount), c.maxOff)
}

export function getOrderTotals(cartTotal, couponCode) {
  const deliveryFee = cartTotal >= 299 ? 0 : 49
  const gst = Math.round(cartTotal * 0.05)
  const discount = getCouponDiscount(cartTotal, couponCode)
  const finalTotal = cartTotal + deliveryFee + gst - discount
  return { deliveryFee, gst, discount, finalTotal }
}