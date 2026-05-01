<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterStore } from '@/stores/registerStore'
import api from '@/axios'

const router = useRouter()
const registerStore = useRegisterStore()

const loading = ref(false)

const selectedPlan = computed(() => registerStore.plan)
const billingType = computed(() => registerStore.billingType)

/**
 * ✅ FIX UTAMA:
 * Backend kirim price sebagai STRING ("0")
 * dan free plan ditandai dengan isTrial / tag FREE
 */
const isFreePlan = computed(() => {
  if (!selectedPlan.value) return false

  return (
    Number(selectedPlan.value.price) === 0 ||
    selectedPlan.value.isTrial === true ||
    selectedPlan.value.tag === 'FREE'
  )
})

/**
 * ✅ Nominal transfer
 * - Free → Rp 0
 * - Paid → hitung dari price
 */
const transferAmount = computed(() => {
  if (!selectedPlan.value) return 'Rp 0'

  const price = Number(selectedPlan.value.price || 0)

  if (price === 0) return 'Rp 0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
})

const submitRegistration = async () => {
  try {
    loading.value = true

    const payload = {
      // ===== FORM REGISTER =====
      name: registerStore.form.name,
      email: registerStore.form.email,
      password: registerStore.form.password,
      number: registerStore.form.number,
      outlet: registerStore.form.outlet,

      // ===== SUBSCRIPTION =====
      subscriptionPlanId: registerStore.plan.id,
      billingType: registerStore.billingType,
      price: Number(registerStore.plan.price),

      paymentStatus: isFreePlan.value ? 'free' : 'pending'
    }

    console.log('FINAL PAYLOAD:', payload)

    await api.post('/users', payload)

    registerStore.$reset()
    router.push('/login')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  } 
}

</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-white border-b">
      <div class="max-w-5xl mx-auto px-6 py-8 text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900">
          Selesaikan Pembayaran
        </h1>
        <p class="mt-4 text-gray-600 max-w-2xl mx-auto">
          Satu langkah lagi untuk mengaktifkan sistem POS bisnismu.
          Silakan lakukan pembayaran sesuai paket yang kamu pilih.
        </p>
      </div>
    </section>

    <!-- Payment Content -->
    <section class="max-w-3xl mx-auto px-6 py-8">
      <div class="bg-white rounded-2xl shadow-sm p-8">
        <!-- Selected Plan Info -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900">Ringkasan Paket</h2>
          <div class="mt-4 flex justify-between items-center">
            <div>
              <p class="font-medium text-gray-800">{{ selectedPlan?.name }}</p>
              <p class="text-sm text-gray-500 capitalize">
                Billing {{ billingType }} —
                <span class="font-medium text-gray-700">
                  {{ transferAmount }}
                </span>
              </p>
            </div>
            <p class="font-semibold text-gray-900">
              {{ transferAmount }}
            </p>
          </div>
        </div>

        <!-- QRIS (ONLY PAID PLAN) -->
        <div
          v-if="!isFreePlan"
          class="border rounded-xl p-6 text-center"
        >
          <h3 class="font-semibold text-gray-900 mb-2">Scan QRIS untuk Pembayaran</h3>
          <p class="text-sm text-gray-600 mb-6">
            Gunakan aplikasi e-wallet atau mobile banking yang mendukung QRIS
          </p>

          <img
            src="/images/qris.jpeg"
            alt="QRIS Payment"
            class="mx-auto w-64 h-64 object-contain"
          />

          <p class="mt-6 text-sm text-gray-700">
            Setelah melakukan pembayaran, harap konfirmasi ke admin melalui WhatsApp
            <span class="font-semibold">087770999062</span>
          </p>
        </div>

        <!-- FREE PLAN INFO -->
        <div
          v-else
          class="border border-dashed rounded-xl p-6 text-center bg-gray-50"
        >
          <h3 class="font-semibold text-gray-900 mb-2">Paket Gratis</h3>
          <p class="text-sm text-gray-600">
            Kamu memilih paket gratis / trial.
            Tidak diperlukan pembayaran.
            Silakan lanjutkan pendaftaran untuk langsung menggunakan sistem.
          </p>
        </div>

        <!-- Action Button -->
        <div class="mt-5">
          <button
            @click="submitRegistration"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {{ loading ? 'Memproses...' : 'Lanjutkan Pendaftaran' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
