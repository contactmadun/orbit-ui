<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRegisterStore } from '@/stores/registerStore'
import api from '@/axios'

const router = useRouter()
const registerStore = useRegisterStore()

// default billing
const billingType = ref('daily')

const selectPlan = (plan) => {
  registerStore.plan = plan
  registerStore.billingType = billingType.value
  router.push('/payment')
}

/* =========================
 * FETCH PLANS
 * ========================= */
const rawPlans = ref([])
const loadingPlans = ref(false)

async function fetchPlans() {
  loadingPlans.value = true
  try {
    const res = await api.get('/subscription', {
      params: { billingType: billingType.value }
    })
    rawPlans.value = res.data.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingPlans.value = false
  }
}

function buildPlanDescriptions(plan) {
  const list = []
  list.push(`Hingga ${plan.maxOutlets} outlet`)
  list.push(`Hingga ${plan.maxUsers} pengguna`)

  let featuresJson = plan.featuresJson
  if (typeof featuresJson === 'string') {
    try { featuresJson = JSON.parse(featuresJson) } catch { featuresJson = {} }
  }

  if (featuresJson?.maxTransactionPerDay) {
    list.push(`Transaksi hingga ${featuresJson.maxTransactionPerDay} / hari`)
  }

  let features = plan.features
  if (typeof features === 'string') {
    try { features = JSON.parse(features) } catch { features = [] }
  }

  if (Array.isArray(features)) list.push(...features)
  if (plan.isTrial) list.push('Cocok untuk mencoba sistem')

  return list
}

const plans = computed(() =>
  rawPlans.value
    .filter(p => p.billingType === billingType.value)
    .map(p => ({
      ...p,
      descriptions: buildPlanDescriptions(p),
      priceLabel: Number(p.price) === 0
        ? 'Gratis'
        : `Rp ${Number(p.price).toLocaleString('id-ID')}`
    }))
)

onMounted(fetchPlans)
watch(billingType, fetchPlans)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HERO -->
    <div class="max-w-5xl mx-auto px-6 pt-20 text-center">
      <h1 class="text-4xl font-bold text-gray-900">
        Pilih Paket Terbaik untuk Bisnismu
      </h1>
      <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        Sistem POS fleksibel untuk mengelola outlet, pengguna, dan transaksi.
        Pilih skema harian atau bulanan sesuai kebutuhan bisnismu.
      </p>

      <!-- TOGGLE -->
      <div class="mt-8 inline-flex bg-gray-100 rounded-xl p-1">
        <button
          @click="billingType = 'daily'"
          :class="billingType === 'daily'
            ? 'bg-white shadow text-gray-900'
            : 'text-gray-500'"
          class="px-6 py-2 rounded-lg text-sm font-semibold transition"
        >
          Harian
        </button>
        <button
          @click="billingType = 'monthly'"
          :class="billingType === 'monthly'
            ? 'bg-white shadow text-gray-900'
            : 'text-gray-500'"
          class="px-6 py-2 rounded-lg text-sm font-semibold transition"
        >
          Bulanan
        </button>
      </div>
    </div>

    <!-- PRICING (HORIZONTAL SCROLL) -->
    <div class="relative max-w-6xl mx-auto px-4 py-16">
      <div class="overflow-x-auto scrollbar-thin">
        <div class="flex gap-6 px-2">

          <!-- LOADING -->
          <div
            v-if="loadingPlans"
            v-for="i in 3"
            :key="i"
            class="shrink-0 w-80 h-[560px] bg-gray-200 animate-pulse rounded-2xl"
          />

          <!-- CARDS -->
          <div
            v-else
            v-for="plan in plans"
            :key="plan.id"
            class="relative shrink-0 w-80"
          >
            <!-- HIGHLIGHT WRAPPER -->
            <div
              v-if="plan.isHighlight"
              class="rounded-2xl bg-blue-800 p-1 shadow-xl h-full"
            >
              <div class="px-4 py-2 text-center">
                <p class="text-sm font-semibold text-white">
                  Rekomendasi Buat Kamu
                </p>
              </div>

              <div class="rounded-xl bg-white p-6 flex flex-col min-h-[520px]">
                <!-- HEADER -->
                <div class="flex justify-between items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ plan.name }}
                  </h3>
                  <span
                    v-if="plan.tag"
                    class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-800 text-white"
                  >
                    {{ plan.tag }}
                  </span>
                </div>
                <p class="text-sm text-slate-500">{{ plan.descriptionPlans }}</p>

                <!-- PRICE -->
                <div class="mt-4">
                  <p class="text-4xl font-bold text-gray-900">{{ plan.priceLabel }}</p>
                  <p class="text-sm text-gray-500">/ {{ plan.durationDays }} hari</p>
                </div>

                <div class="border-t my-5"></div>

                <p class="text-sm font-semibold text-gray-800 mb-4">Apa yang didapatkan:</p>

                <ul class="space-y-3 text-sm text-gray-700 flex-1">
                  <li v-for="desc in plan.descriptions" :key="desc" class="flex gap-3">
                    <span class="text-blue-800">✓</span>
                    <span>{{ desc }}</span>
                  </li>
                </ul>

                <button
                  class="mt-auto py-2.5 rounded-lg text-sm font-semibold bg-blue-800 text-white hover:bg-blue-900 transition"
                  @click="selectPlan(plan)"
                >
                  {{ plan.isTrial ? 'Coba Gratis' : 'Gunakan Paket Ini' }}
                </button>
              </div>
            </div>

            <!-- NORMAL CARD -->
            <div
              v-else
              class="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col min-h-[550px]"
            >
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-900">{{ plan.name }}</h3>
                <span
                  v-if="plan.tag"
                  class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700"
                >
                  {{ plan.tag }}
                </span>
              </div>
              <p class="text-sm text-slate-500">{{ plan.descriptionPlans }}</p>

              <div class="mt-4">
                <p class="text-4xl font-bold text-gray-900">{{ plan.priceLabel }}</p>
                <p class="text-sm text-gray-500">/ {{ plan.durationDays }} hari</p>
              </div>

              <div class="border-t my-5"></div>

              <p class="text-sm font-semibold text-gray-800 mb-4">Apa yang didapatkan:</p>

              <ul class="space-y-3 text-sm text-gray-700 flex-1">
                <li v-for="desc in plan.descriptions" :key="desc" class="flex gap-3">
                  <span class="text-blue-800">✓</span>
                  <span>{{ desc }}</span>
                </li>
              </ul>

              <button
                class="mt-auto py-2.5 rounded-lg text-sm font-semibold bg-gray-800 text-white hover:bg-black transition"
                @click="selectPlan(plan)"
              >
                {{ plan.isTrial ? 'Coba Gratis' : 'Gunakan Paket Ini' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 8px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>