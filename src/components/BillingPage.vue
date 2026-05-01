<script setup>
import api from '@/axios'
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import BillingDetailModal from '@/components/reusable/BillingDetailModal.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ActivityIcon } from 'lucide-vue-next'

const showDetail = ref(false)
const selectedBilling = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const skeletonRows = 10

const router = useRouter()

function goToDetail(order) {
  router.push(`/billing/${order.id}`)
}

function openDetail(order) {
  selectedBilling.value = order
  showDetail.value = true
}

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5

  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})


async function acceptBilling(order) {
  try {
    await api.post(`/subscription-payment/${order.id}/accept`)

    // refresh data
    await fetchBillingHistory()

    showDetail.value = false
  } catch (err) {
    console.error(err)
    alert('Gagal menerima pembayaran')
  }
}

const billingHistory = ref([])
const loadingBilling = ref(false)

async function fetchBillingHistory(page = 1) {
  loadingBilling.value = true

  try {
    const res = await api.get(`/subscription-payment?page=${page}`)

    currentPage.value = res.data.pagination.currentPage
    totalPages.value = res.data.pagination.totalPages

    billingHistory.value = res.data.data.map(item => ({
      id: item.id,
      tenantName: item.Subscription?.Tenant?.name ?? '-',
      planName: item.SubscriptionPlan?.name ?? '-',
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
    setTimeout(() => {
      loadingBilling.value = false
    }, 300) // bikin smooth
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchBillingHistory(page)
}

function exportBilling() {
  if (billingHistory.value.length === 0) {
    alert('Tidak ada data untuk diexport')
    return
  }

  const headers = [
    'Tenant',
    'Plan',
    'Invoice',
    'Amount',
    'Purchase Date',
    'Paid Date',
    'Status'
  ]

  const rows = billingHistory.value.map(item => [
    `"${item.tenantName}"`,
    `"${item.planName}"`,
    `"${item.invoice}"`,
    `"${item.amount}"`,
    `"${item.purchase}"`,
    `"${item.end}"`,
    `"${item.status}"`
  ])

  const csvContent =
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const today = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `billing-history-${today}.csv`
  link.click()

  URL.revokeObjectURL(url)
}


onMounted(() => {
  fetchBillingHistory()
})
</script>

<template>
  <DashboardLayout title="Billing">
    <div class="p-4 space-y-6 bg-gray-50 min-h-screen">

      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Latest customer orders</h1>
        <div class="flex gap-2">
          <button @click="exportBilling" class="px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-100">
            Export
          </button>
          <button class="px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-100">
            Add Invoice
          </button>
        </div>
      </div>

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
  </div>

  <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="p-3 text-left">
                <input type="checkbox" />
              </th>
              <th class="p-3 text-left">Name Tenant</th>
              <th class="p-3 text-left">Plan</th>
              <th class="p-3 text-left">Invoice</th>
              <th class="p-3 text-left">Amount</th>
              <th class="p-3 text-left">Purchase Date</th>
              <th class="p-3 text-left">Status</th>
              <th class="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>

            <!-- Skeleton Loading -->
            <template v-if="loadingBilling">
              <tr
                v-for="n in skeletonRows"
                :key="'skeleton-' + n"
                class="border-t animate-pulse"
              >
                <td class="p-3"><div class="h-4 w-4 bg-gray-200 rounded"></div></td>
                <td class="p-3"><div class="h-4 w-32 bg-gray-200 rounded"></div></td>
                <td class="p-3"><div class="h-4 w-24 bg-gray-200 rounded"></div></td>
                <td class="p-3"><div class="h-4 w-28 bg-gray-200 rounded"></div></td>
                <td class="p-3"><div class="h-4 w-20 bg-gray-200 rounded"></div></td>
                <td class="p-3"><div class="h-4 w-24 bg-gray-200 rounded"></div></td>
                <td class="p-3"><div class="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                <td class="p-3"><div class="h-6 w-16 bg-gray-200 rounded-full"></div></td>
              </tr>
            </template>

            <!-- Data Rows -->
            <template v-else>
              <tr
                v-for="order in billingHistory"
                :key="order.id"
                class="border-t hover:bg-gray-50 transition-colors duration-150"
              >
                <td class="p-3">
                  <input type="checkbox" />
                </td>
                <td class="p-3 font-medium text-gray-800">
                  {{ order.tenantName }}
                </td>
                <td class="p-3">
                  {{ order.planName }}
                </td>
                <td class="p-3">{{ order.invoice }}</td>
                <td class="p-3">{{ order.amount }}</td>
                <td class="p-3">{{ order.purchase }}</td>
                <td class="p-3">
                  <span
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="
                      order.status === 'Success'
                        ? 'bg-green-50 text-green-800'
                        : order.status === 'Processing'
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-red-50 text-red-800'
                    "
                  >
                    {{ order.status }}
                  </span>
                </td>
                <td class="p-3">
                  <button
                    @click="openDetail(order)"
                    class="text-xs px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-900 hover:text-white transition-all duration-200"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            </template>

          </tbody>
        </table>
        <div class="flex justify-center items-center gap-1 mt-6 mb-5 text-sm">

          <!-- Prev -->
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-2 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-40"
          >
            ‹
          </button>

          <!-- Number Pages -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            class="w-8 h-8 rounded-md border text-xs font-semibold transition"
            :class="page === currentPage
              ? 'bg-blue-900 text-white'
              : 'bg-white text-gray-500 hover:bg-gray-100'"
          >
            {{ page }}
          </button>

          <!-- Next -->
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-40"
          >
            ›
          </button>

        </div>
        <BillingDetailModal
          :show="showDetail"
          :data="selectedBilling"
          @close="showDetail = false"
          @accept="acceptBilling"
        />
      </div>
    </div>
    </div>
  </DashboardLayout>
</template>
