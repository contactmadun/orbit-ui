// composables/useCurrencyInput.js
import { ref, watch } from "vue"

function formatCurrency(value) {
  if (!value) return ""
  return new Intl.NumberFormat("id-ID").format(
    value.toString().replace(/\D/g, "")
  )
}

function parseCurrency(value) {
  if (!value) return 0
  return parseInt(value.toString().replace(/\./g, ""), 10) || 0
}

export function useCurrencyInput(initial = "") {
  const model = ref(initial)

  watch(model, (newVal, oldVal) => {
    if(!newVal){
      return
    }
    
    // Ambil angka mentah
    const numeric = newVal ? newVal.toString().replace(/\D/g, "") : ""

    // Format ke ribuan
    const formatted = formatCurrency(numeric)

    // Jika hasil format beda dengan input terakhir, update value
    if (formatted !== newVal) {
      model.value = formatted
    }
  })

  return {
    model,
    parse: () => parseCurrency(model.value),
    reset: () => { model.value = "" }
  }
}
