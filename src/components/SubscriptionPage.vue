<script setup>
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import api from '@/axios'
import BaseOverlay from '@/components/reusable/BaseOverlay.vue'
import SlidePanel from '@/components/reusable/SlidePanel.vue'
import SubscriptionPlanForm from '@/components/reusable/SubscriptionPlanForm.vue'
import { Users, Settings, Plus, UserRoundCheckIcon, UserRoundCog, UserRoundX, ActivityIcon } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

const showAddPlan = ref(false)
const editingPlan = ref(null)

function openAddPlan() {
  editingPlan.value = null
  showAddPlan.value = true
}


async function handleAddPlan(data) {
  try {
    if (editingPlan.value) {
      await api.put(
        `/subscription/${editingPlan.value.id}`,
        data
      )
      alert('Plan berhasil diperbarui')
    } else {
      await api.post('/subscription', data)
      alert('Plan berhasil dibuat')
    }

    showAddPlan.value = false
    editingPlan.value = null
    await fetchPlans()
  } catch (error) {
    console.error(error)
    alert('Gagal menyimpan plan')
  }
}



const isSuperAdmin = true // nanti dari auth / role


const billingType = ref('daily')

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [500000, 750000, 900000, 1200000, 1500000, 1700000],
      borderColor: '#2563eb',
      backgroundColor: 'transparent',
      tension: 0.45,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#2563eb'
    },
    {
      label: 'MRR',
      data: [400000, 520000, 680000, 850000, 1000000, 1200000],
      borderColor: '#111827',
      backgroundColor: 'transparent',
      tension: 0.45,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#111827'
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `Rp ${context.parsed.y.toLocaleString('id-ID')}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        borderDash: [5, 5],
        color: '#e5e7eb'
      },
      ticks: {
        callback: function (value) {
          return 'Rp ' + value.toLocaleString('id-ID')
        }
      }
    }
  }
}

function buildPlanDescriptions(plan) {
  const list = []

  list.push(`Hingga ${plan.maxOutlets} outlet`)
  list.push(`Hingga ${plan.maxUsers} pengguna`)

  /* =========================
   * NORMALISASI featuresJson
   * ========================= */
  let featuresJson = plan.featuresJson
  if (typeof featuresJson === 'string') {
    try {
      featuresJson = JSON.parse(featuresJson)
    } catch {
      featuresJson = {}
    }
  }

  if (featuresJson?.maxTransactionPerDay) {
    list.push(
      `Transaksi hingga ${featuresJson.maxTransactionPerDay} / hari`
    )
  }

  /* =========================
   * NORMALISASI features
   * ========================= */
  let features = plan.features
  if (typeof features === 'string') {
    try {
      features = JSON.parse(features)
    } catch {
      features = []
    }
  }

  if (Array.isArray(features)) {
    list.push(...features)
  }

  if (plan.isTrial) {
    list.push('Cocok untuk mencoba sistem')
  }

  return list
}



const formatRupiah = (value) =>
  value === 0
    ? 'Gratis'
    : 'Rp ' + value.toLocaleString('id-ID')

const rawPlans = ref([])
const loadingPlans = ref(false)

async function fetchPlans() {
  loadingPlans.value = true
  try {
    const res = await api.get('/subscription', {
      params: {
        billingType: billingType.value
      }
    })

    rawPlans.value = res.data.data
    console.log(rawPlans);
  } catch (error) {
    console.error(error)
    alert('Gagal mengambil data plan')
  } finally {
    loadingPlans.value = false
  }
}


const plans = computed(() =>
  rawPlans.value
    .filter(p => p.billingType === billingType.value)
    .map(p => {
      const priceNumber = Number(p.price)

      return {
        ...p,
        descriptionPlans: buildPlanDescriptions(p), // ✅ field baru
        priceLabel:
          priceNumber === 0
            ? 'Gratis'
            : `Rp ${priceNumber.toLocaleString('id-ID')}`
      }
    })
)

const billingHistory = ref([])
const loadingBilling = ref(false)

async function fetchBillingHistory() {
  loadingBilling.value = true
  try {
    const res = await api.get('/subscription-payment/lattest')

    billingHistory.value = res.data.data.map(item => ({
      id: item.id,
      tenantName: item.Subscription?.Tenant?.name ?? '-',
      planName: item.Subscription?.SubscriptionPlan?.name ?? '-',
      invoice: item.invoiceNumber,
      amount: 'Rp ' + Number(item.amount).toLocaleString('id-ID'),
      purchase: item.createdAt
        ? new Date(item.createdAt).toISOString().slice(0, 10)
        : '-',
      end: item.paidAt
        ? new Date(item.paidAt).toISOString().slice(0, 10)
        : '-',
      status:
        item.paymentStatus === 'paid'
          ? 'Success'
          : item.paymentStatus === 'pending'
            ? 'Processing'
            : 'Failed'
    }))
  } catch (error) {
    console.error(error)
  } finally {
    loadingBilling.value = false
  }
}

function editPlan(plan) {
  editingPlan.value = plan
  showAddPlan.value = true
}

onMounted(() => {
  fetchPlans()
  fetchBillingHistory()
})


watch(billingType, () => {
  fetchPlans()
})

</script>

<template>
  <DashboardLayout title="Berlangganan">
    <div class="p-2 space-y-8 bg-gray-50 min-h-screen">

      <!-- HEADER -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Overview Subscription</h1>

        <button class="group relative flex items-center justify-center px-6 py-2.5 bg-blue-800 text-white font-bold text-sm rounded-lg transition-all duration-300 ease-out hover:bg-blue-900 hover:shadow-xl hover:shadow-blue-900/30 hover:scale-[1.03] active:scale-100 overflow-hidden">
          <span class="absolute left-4 flex items-center opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            <Plus class="w-4 h-4" />
          </span>
          <span class="transition-transform duration-300 group-hover:translate-x-3" @click="openAddPlan">
            Add Plan
          </span>
        </button>
      </div>

      <!-- SUMMARY + GRAPH -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <!-- LEFT : 4 SUMMARY CARDS (2x2) -->
        <div class="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

          <div class="bg-white border rounded-lg p-5">
            <div class="flex gap-2 items-center mb-2">
              <div class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center">
                <Users class="w-4 h-4" />
              </div>
              <p class="text-base font-semibold text-slate-800">Subscribe Monthly</p>
            </div>
            <div class="flex items-center mb-2 gap-1">
              <h2 class="text-2xl text-slate-800 font-bold mt-1">1,573</h2>
              <p class="text-xs text-green-800 mt-1">+15.9%</p>
            </div>
            <p class="text-sm text-slate-600">Data real time tenant yang tercatat di sistem.</p>
          </div>

          <div class="bg-white border rounded-xl p-5">
            <div class="flex gap-2 items-center mb-2">
              <div class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center">
                <UserRoundCheckIcon class="w-4 h-4" />
              </div>
              <p class="text-base font-semibold text-slate-800">Subscribe Daily</p>
            </div>
            <div class="flex items-center mb-2m gap-1">
              <h2 class="text-2xl text-slate-800 font-bold mt-1">1,223</h2>
              <p class="text-xs text-green-800 mt-1">+15.9%</p>
            </div>
            <p class="text-sm text-slate-600">Data real time tenant aktif transaksi di sistem.</p>
          </div>

          <div class="bg-white border rounded-xl p-5">
            <div class="flex gap-2 items-center mb-2">
              <div class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center">
                <UserRoundCog class="w-4 h-4" />
              </div>
              <p class="text-base font-semibold text-slate-800">Subscribe Trial</p>
            </div>
            <div class="flex items-center mb-2 gap-1">
              <h2 class="text-2xl text-slate-800 font-bold mt-1">300</h2>
              <p class="text-xs text-green-800 mt-1">+15.9%</p>
            </div>
            <p class="text-sm text-slate-600">Data real time tenant trial transaksi di sistem.</p>
          </div>

          <div class="bg-white border rounded-xl p-5">
            <div class="flex gap-2 items-center mb-2">
              <div class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center">
                <UserRoundX class="w-4 h-4" />
              </div>
              <p class="text-base font-semibold text-slate-800">Subscribe Expired</p>
            </div>
            <div class="flex items-center mb-2 gap-1">
              <h2 class="text-2xl text-slate-800 font-bold mt-1">50</h2>
              <p class="text-xs text-green-800 mt-1">+15.9%</p>
            </div>
            <p class="text-sm text-slate-600">Data real time tenant expired di sistem.</p>
          </div>
        </div>

        <!-- RIGHT : CHART -->
        <div class="lg:col-span-1 bg-white border rounded-xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Monthly Revenue Overview</h3>
            <span class="text-sm text-gray-500">Monthly</span>
          </div>

          <div class="h-72">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- TOGGLE -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Subscription Plans</h1>
        <div class="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            @click="billingType = 'daily'"
            :class="billingType === 'daily'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-500'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Daily
          </button>
          <button
            @click="billingType = 'monthly'"
            :class="billingType === 'monthly'
              ? 'bg-white shadow text-gray-900'
              : 'text-gray-500'"
            class="px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Monthly
          </button>
        </div>
      </div>

      <!-- PRICING CARDS - HORIZONTAL SCROLL -->
      <div class="relative">
  <div class="overflow-x-auto scrollbar-thin">
    <div class="flex gap-6 px-2 py-8">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="relative shrink-0 w-72"
      >
        <!-- Wrapper untuk highlight dengan header -->
        <div
          v-if="plan.isHighlight"
          class="rounded-2xl bg-blue-800 p-1 shadow-lg h-full"
        >
          <!-- Header rekomendasi -->
          <div class="px-4 py-2 text-center">
            <p class="text-sm font-medium text-white">
              Rekomendasi Buat Kamu
            </p>
          </div>
          
          <!-- Card content dengan background putih -->
          <div class="rounded-xl bg-white p-6 flex flex-col min-h-[500px]">
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
            <p class="text-sm text-slate-500">
                {{ plan.descriptions }}
            </p>

            <!-- PRICE -->
            <div class="mt-4">
              <p class="text-4xl font-bold text-gray-900">
                {{ plan.priceLabel }}
              </p>
              <p class="text-sm text-gray-500">
                / {{ plan.durationDays }} hari
              </p>
            </div>

            <!-- DIVIDER -->
            <div class="border-t border-gray-200 my-5"></div>

            <!-- FEATURE TITLE -->
            <p class="text-sm font-semibold text-gray-800 mb-4">
              Apa yang didapatkan:
            </p>

            <!-- FEATURES -->
            <ul class="space-y-3 text-sm text-gray-700 flex-1 mb-6">
              <li
                  v-for="desc in plan.descriptionPlans"
                  :key="desc"
                >
                <span class="text-blue-800 mt-0.5">✓</span>
                <span>{{ desc }}</span>
              </li>
            </ul>

            <!-- CTA -->
<div
  v-if="isSuperAdmin"
  class="mt-auto flex gap-2"
>
  <!-- CTA UTAMA -->
  <button
    class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition bg-blue-800 text-white hover:bg-blue-900"
  >
    {{ plan.isTrial ? 'Coba Gratis' : 'Gunakan Paket Ini' }}
  </button>

  <!-- EDIT PLAN -->
  <button
  @click.stop="editPlan(plan)"
  class="w-12 flex items-center justify-center rounded-lg border hover:bg-blue-800 hover:text-white"
>
  <Settings class="w-4 h-4" />
</button>

</div>

<!-- CTA USER BIASA -->
<button
  v-else
  class="mt-auto w-full py-2.5 rounded-lg text-sm font-semibold transition bg-blue-800 text-white hover:bg-blue-900"
>
  {{ plan.isTrial ? 'Coba Gratis' : 'Gunakan Paket Ini' }}
</button>
          </div>
        </div>

        <!-- Card biasa tanpa highlight -->
        <div
          v-else
          class="rounded-2xl border border-gray-200 bg-white transition-all duration-300 h-full"
        >
          <div class="p-6 flex flex-col min-h-[550px]">
            <!-- HEADER -->
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ plan.name }}
              </h3>
              <span
                v-if="plan.tag"
                class="text-xs font-semibold px-2 py-1 rounded-full"
                :class="plan.isTrial ? 'bg-blue-50 text-blue-700' : 'bg-blue-50 text-blue-700'"
              >
                {{ plan.tag }}
              </span>
            </div>
            <p class="text-sm text-slate-500">
                {{ plan.descriptions }}
            </p>

            <!-- PRICE -->
            <div class="mt-4">
              <p class="text-4xl font-bold text-gray-900">
                {{ plan.priceLabel }}
              </p>
              <p class="text-sm text-gray-500">
                / {{ plan.durationDays }} hari
              </p>
            </div>

            <!-- DIVIDER -->
            <div class="border-t border-gray-200 my-5"></div>

            <!-- FEATURE TITLE -->
            <p class="text-sm font-semibold text-gray-800 mb-4">
              Apa yang didapatkan:
            </p>

            <!-- FEATURES -->
            <ul class="space-y-3 text-sm text-gray-700 flex-1 mb-6">
              <li
                v-for="desc in plan.descriptionPlans"
                :key="desc"
              >
                <span class="text-blue-800 mt-0.5">✓</span>
                <span>{{ desc }}</span>
              </li>
            </ul>

            <!-- CTA -->
<div
  v-if="isSuperAdmin"
  class="mt-auto flex gap-2"
>
  <!-- CTA UTAMA -->
  <button
    class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition bg-gray-500 text-white hover:bg-gray-800"
  >
    {{ plan.isTrial ? 'Coba Gratis' : 'Gunakan Paket Ini' }}
  </button>

  <!-- EDIT PLAN -->
  <button
  @click.stop="editPlan(plan)"
  class="w-12 flex items-center justify-center rounded-lg border hover:bg-gray-800 hover:text-white"
>
  <Settings class="w-4 h-4" />
</button>

</div>

<!-- CTA USER BIASA -->
<button
  v-else
  class="mt-auto w-full py-2.5 rounded-lg text-sm font-semibold transition bg-gray-500 text-white hover:bg-gray-800"
>
  {{ plan.isTrial ? 'Coba Gratis' : 'Gunakan Paket Ini' }}
</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      <!-- BILLING HISTORY -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
  <div class="flex justify-between items-center mb-6">
    <div class="flex gap-4">
      <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
        <ActivityIcon class="w-5 h-5 text-blue-900" />
      </div>
      <div>
        <h3 class="text-xl font-semibold text-gray-900">Lattest Billing</h3>
        <h3 class="text-sm text-slate-500">Order Billing Plan Subscription</h3>
      </div>
    </div>
    <RouterLink to="/subscription/billing" class="font-semibold text-blue-900 hover:text-white px-5 py-2 hover:bg-blue-900 rounded-xl hover:shadow-md">See All</RouterLink>
    <!-- <input
      type="text"
      placeholder="Search..."
      class="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    /> -->
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-gray-50 border-y border-gray-100">
          <th class="text-left py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider first:rounded-tl-lg last:rounded-tr-lg">
            Name Tenant
          </th>
          <th class="text-left py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider first:rounded-tl-lg last:rounded-tr-lg">
            Plan
          </th>
          <th class="text-left py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider first:rounded-tl-lg last:rounded-tr-lg">
            Invoice
          </th>
          <th class="text-left py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider">
            Amount
          </th>
          <th class="text-left py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider">
            Purchase Date
          </th>
          <th class="text-left py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider">
            End Date
          </th>
          <th class="text-left py-3 px-4 font-semibold text-gray-600 uppercase text-xs tracking-wider first:rounded-tl-lg last:rounded-tr-lg">
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loadingBilling">
          <td colspan="6" class="py-6 text-center text-slate-400">
            Loading billing history...
          </td>
        </tr>
        <tr
          v-for="item in billingHistory"
          :key="item.id"
          class="hover:bg-gray-50 transition-colors duration-150"
        />
        <tr v-for="item in billingHistory" :key="item.id">
          <td class="py-4 px-4">{{ item.tenantName }}</td>
          <td class="py-4 px-4">{{ item.planName }}</td>
          <td class="py-4 px-4 font-mono text-xs">{{ item.invoice }}</td>
          <td class="py-4 px-4">{{ item.amount }}</td>
          <td class="py-4 px-4">{{ item.purchase }}</td>
          <td class="py-4 px-4">{{ item.end }}</td>
          <td class="py-4 px-4">
            <span
              class="px-2 py-1 text-xs rounded-full font-medium"
              :class="
                item.status === 'Success'
                  ? 'bg-green-50 text-green-800'
                  : item.status === 'Processing'
                    ? 'bg-blue-50 text-blue-800'
                    : 'bg-red-50 text-red-800'
              "
            >
              {{ item.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
</div>
    <BaseOverlay
      :show="showAddPlan"
      @close="showAddPlan = false"
    />

    <SlidePanel
      :show="showAddPlan"
      :title="editingPlan ? 'Edit Plan Subscription' : 'Create Plan Subscription'"
      width="w-[35%]"
      @close="() => {
        showAddPlan = false
        editingPlan = null
      }"
    >
      <SubscriptionPlanForm
        :initialData="editingPlan"
        @submit="handleAddPlan"
        @cancel="() => {
          showAddPlan = false
          editingPlan = null
        }"
      />
    </SlidePanel>


    <div v-if="loadingPlans" class="flex gap-6 px-6 py-10">
      <div
        v-for="i in 3"
        :key="i"
        class="w-72 h-[520px] bg-gray-100 animate-pulse rounded-xl"
      />
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Custom scrollbar untuk horizontal scroll - hanya untuk pricing section */
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