// helpers/currencyFormatter.js
export function formatCurrency(value) {
  if (!value) return ""
  return new Intl.NumberFormat("id-ID").format(
    value.toString().replace(/\D/g, "")
  )
}

export function parseCurrency(value) {
  if (!value) return 0
  return parseInt(value.toString().replace(/\./g, ""), 10) || 0
}

/**
 * Handler reusable untuk input
 * @param {Event} e
 * @param {Ref} modelRef
 */
export function handleCurrencyInput(e, modelRef) {
  const raw = e.target.value
  const parsed = parseCurrency(raw)
  modelRef.value = formatCurrency(parsed)
}
