<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/axios'
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import { Users, Download } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const subscribers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const skeletonRows = 10

// FILTER STATE
const selectedStatus = ref('all')
const searchQuery = ref('')

// STATUS OPTIONS
const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Suspended', value: 'suspended' }
]

async function fetchSubscribers(page = 1) {
  loading.value = true
  try {
    const res = await api.get(
      `/subscription/subscriber?page=${page}&status=${selectedStatus.value}`
    )

    currentPage.value = res.data.pagination.currentPage
    totalPages.value = res.data.pagination.totalPages

    subscribers.value = res.data.data.map(item => ({
      id: item.id,
      tenantName: item.Tenant?.name ?? '-',
      planName: item.SubscriptionPlan?.name ?? '-',
      billingType: item.SubscriptionPlan?.billingType ?? '-',
      startedAt: item.startedAt
        ? new Date(item.startedAt).toISOString().slice(0, 10)
        : '-',
      endedAt: item.endedAt
        ? new Date(item.endedAt).toISOString().slice(0, 10)
        : '-',
      status: item.status
    }))

  } catch (err) {
    console.error(err)
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}

// COMPUTED FILTER
const filteredSubscribers = computed(() => {
  return subscribers.value.filter(item => {
    const matchStatus =
      selectedStatus.value === 'all' ||
      item.status === selectedStatus.value

    const matchSearch =
      item.tenantName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.planName.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchStatus && matchSearch
  })
})

// EXPORT CSV
function exportCSV() {
  const headers = [
    'Tenant',
    'Plan',
    'Billing',
    'Start',
    'End',
    'Status'
  ]

  const rows = filteredSubscribers.value.map(item => [
    item.tenantName,
    item.planName,
    item.billingType,
    item.startedAt,
    item.endedAt,
    item.status
  ])

  const csvContent =
    [headers, ...rows].map(e => e.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'subscribers.csv'
  link.click()
}

function goToDetail(id) {
  router.push({ name: 'subscriberDetail', params: { id } })
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchSubscribers(page)
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

onMounted(fetchSubscribers)

watch(selectedStatus, () => {
  currentPage.value = 1
  fetchSubscribers(1)
})
</script>


<template>
  <DashboardLayout title="List Subscriber">
    <div class="p-4 space-y-6 bg-gray-50 min-h-screen">

      <h1 class="text-2xl font-semibold">List Subscriber</h1>

      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
            <Users class="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">Subscribers</h3>
            <p class="text-sm text-slate-500">All active & inactive subscribers</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <!-- FILTER + SEARCH + EXPORT -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 py-1">

            <!-- STATUS FILTER TABS -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tab in statusTabs"
                :key="tab.value"
                @click="selectedStatus = tab.value"
                class="px-4 py-2 text-sm rounded-full border font-medium transition"
                :class="
                  selectedStatus === tab.value
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                "
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- SEARCH + EXPORT -->
            <div class="flex items-center gap-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search tenant or plan..."
                class="px-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                @click="exportCSV"
                class="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border
                      bg-white hover:bg-gray-100 font-medium"
              >
                <Download class="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-600">
              <tr>
                <th class="p-3 text-left">Tenant</th>
                <th class="p-3 text-left">Plan</th>
                <th class="p-3 text-left">Billing</th>
                <th class="p-3 text-left">Start</th>
                <th class="p-3 text-left">End</th>
                <th class="p-3 text-left">Status</th>
                <th class="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>

              <!-- 🔹 Skeleton Loading -->
              <template v-if="loading">
                <tr
                  v-for="n in 10"
                  :key="'skeleton-' + n"
                  class="border-t animate-pulse"
                >
                  <td class="p-3">
                    <div class="h-4 w-32 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </td>
                </tr>
              </template>

              <!-- 🔹 Empty State -->
              <tr v-else-if="subscribers.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400">
                  No subscribers found
                </td>
              </tr>

              <!-- 🔹 Data Rows -->
              <template v-else>
                <tr
                  v-for="item in subscribers"
                  :key="item.id"
                  class="border-t hover:bg-gray-50 transition-colors duration-150"
                >
                  <td class="p-3 font-medium text-gray-800">
                    {{ item.tenantName }}
                  </td>

                  <td class="p-3">
                    {{ item.planName }}
                  </td>

                  <td class="p-3 capitalize">
                    {{ item.billingType }}
                  </td>

                  <td class="p-3">
                    {{ item.startedAt }}
                  </td>

                  <td class="p-3">
                    {{ item.endedAt }}
                  </td>

                  <td class="p-3">
                    <span
                      class="px-2 py-1 text-xs rounded-full font-medium capitalize"
                      :class="{
                        'bg-green-50 text-green-800': item.status === 'active',
                        'bg-blue-50 text-blue-800': item.status === 'pending',
                        'bg-yellow-50 text-yellow-800': item.status === 'expired',
                        'bg-gray-100 text-gray-700': item.status === 'cancelled',
                        'bg-red-50 text-red-800': item.status === 'suspended'
                      }"
                    >
                      {{ item.status }}
                    </span>
                  </td>

                  <td class="p-3">
                    <button
                      @click="goToDetail(item.id)"
                      class="px-3 py-1 text-xs rounded-full border
                            text-blue-900 font-medium
                            bg-blue-50
                            transition-all duration-200
                            hover:bg-blue-900 hover:text-white"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              </template>

            </tbody>
          </table>
          <div class="flex justify-center items-center gap-1 mt-6 text-sm">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-2 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="changePage(page)"
              class="w-8 h-8 rounded-md border text-xs transition"
              :class="page === currentPage
                ? 'bg-blue-900 text-white'
                : 'bg-white hover:bg-gray-100'"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

