// helpers/numberFormatter.js

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return ""

  return new Intl.NumberFormat("id-ID").format(
    Number(value.toString().replace(/\D/g, ""))
  )
}

export function parseCurrency(value) {
  if (!value) return 0

  return Number(value.toString().replace(/\D/g, ""))
}

/**
 * Reusable handler
 */
export function handleCurrencyInput(event, callback) {
  const raw = event.target.value
  const parsed = parseCurrency(raw)

  callback(parsed)
}