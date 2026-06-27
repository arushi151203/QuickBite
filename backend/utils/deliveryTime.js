/**
 * Parse restaurant delivery_time string like "30-45 min" into estimated minutes.
 * Uses the average of the range; falls back to 30 minutes if unparseable.
 */
export function parseDeliveryMinutes(deliveryTime) {
  if (!deliveryTime) return 30

  const rangeMatch = String(deliveryTime).match(/(\d+)\s*-\s*(\d+)/)
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10)
    const max = parseInt(rangeMatch[2], 10)
    return Math.round((min + max) / 2)
  }

  const singleMatch = String(deliveryTime).match(/(\d+)/)
  if (singleMatch) return parseInt(singleMatch[1], 10)

  return 30
}

export function computeEstimatedDelivery(deliveryTime, fromDate = new Date()) {
  const minutes = parseDeliveryMinutes(deliveryTime)
  const eta = new Date(fromDate)
  eta.setMinutes(eta.getMinutes() + minutes)
  return { estimatedDelivery: eta, estimatedMinutes: minutes }
}