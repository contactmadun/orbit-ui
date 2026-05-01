<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'

const route = useRoute()
const loading = ref(false)

const upgradePlans = ref([])
const downgradePlans = ref([])

const subscription = ref(null)
const planHistory = ref([])

const showUpgradeModal = ref(false)
const showDowngradeModal = ref(false)

const selectedPlanId = ref(null)

const hasUpgrade = computed(() => upgradePlans.value.length > 0)
const hasDowngrade = computed(() => downgradePlans.value.length > 0)

async function submitUpgrade() {
  if (!selectedPlanId.value) return

  await upgrade(selectedPlanId.value)
  showUpgradeModal.value = false
  selectedPlanId.value = null
}

async function submitDowngrade() {
  if (!selectedPlanId.value) return

  await downgrade(selectedPlanId.value)
  showDowngradeModal.value = false
  selectedPlanId.value = null
}



async function fetchAvailablePlans() {
  const res = await api.get(
    `/subscription/${route.params.id}/available-plans`
  )
  upgradePlans.value = res.data.upgradePlans
  downgradePlans.value = res.data.downgradePlans
}

async function upgrade(planId) {
  await api.post(
    `/subscription/${subscription.value.id}/upgrade`,
    { planId }
  )
  fetchDetail()
}

async function downgrade(planId) {
  await api.post(
    `/subscription/${subscription.value.id}/downgrade`,
    { planId }
  )
  fetchDetail()
}


onMounted(() => {
  fetchDetail()
  fetchAvailablePlans()
})


function formatDate(value) {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


async function fetchDetail() {
  loading.value = true
  try {
    const res = await api.get(
      `/subscription/subscriber/${route.params.id}`
    )
    console.log(res.data.data.history);
    subscription.value = res.data.data.subscription
    planHistory.value = res.data.data.history
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}


onMounted(fetchDetail)

// STATUS TOGGLE
async function toggleStatus() {
  const newStatus =
    subscription.value.status === 'active'
      ? 'suspended'
      : 'active'

  await api.patch(
    `/subscription/subscriber/${subscription.value.id}/status`,
    { status: newStatus }
  )

  subscription.value.status = newStatus
}
    
</script>
<template>
  <DashboardLayout title="Subscriber Detail">
    <div class="p-4 space-y-6 bg-gray-50 min-h-screen">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Subscriber Detail</h1>
      </div>

      <!-- ====== SUBSCRIPTION & PLAN INFO (2 KOLOM) ====== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Subscription Info -->
        <div class="bg-white rounded-2xl p-6 border">
          <h2 class="text-lg font-semibold mb-4">Subscription Info</h2>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Tenant</p>
              <p class="font-medium">
                {{ subscription?.Tenant?.name }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Status</p>
              <span
                class="px-3 py-1 rounded-full text-xs font-medium capitalize"
                :class="
                  subscription?.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{ subscription?.status }}
              </span>
            </div>

            <div>
              <p class="text-gray-500">Started At</p>
              <p class="font-medium">
                {{ formatDate(subscription?.startedAt) || '-' }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Ended At</p>
              <p class="font-medium">
                {{ formatDate(subscription?.endedAt) || '-' }}
              </p>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="toggleStatus"
              class="px-4 py-2 rounded-xl text-sm font-medium"
              :class="
                subscription?.status === 'active'
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white'
              "
            >
              {{ subscription?.status === 'active' ? 'Suspend' : 'Activate' }}
            </button>
          </div>
        </div>

        <!-- Plan Info -->
        <div class="bg-white rounded-2xl p-6 border">
          <h2 class="text-lg font-semibold mb-4">Plan Info</h2>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Plan Name</p>
              <p class="font-medium">
                {{ subscription?.SubscriptionPlan?.name }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Billing Type</p>
              <p class="font-medium">
                {{ subscription?.SubscriptionPlan?.billingType }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Price</p>
              <p class="font-medium">
                Rp {{ subscription?.SubscriptionPlan?.price }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Plan Status</p>
              <p class="font-medium capitalize">
                {{ subscription?.status }}
              </p>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              v-if="hasDowngrade"
              @click="showDowngradeModal = true"
              class="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-100"
            >
              Downgrade
            </button>

            <button
              v-if="hasUpgrade"
              @click="showUpgradeModal = true"
              class="px-4 py-2 rounded-xl bg-blue-900 text-white text-sm font-medium"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      <!-- ====== PLAN HISTORY (FULL WIDTH) ====== -->
      <div class="bg-white rounded-2xl p-6 border">
        <h2 class="text-lg font-semibold mb-4">Plan History</h2>

        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-left">Plan</th>
              <th class="p-3 text-left">Start</th>
              <th class="p-3 text-left">End</th>
              <th class="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="history in planHistory"
              :key="history.id"
              class="border-t"
            >
              <td class="p-3">  
                {{ history.newPlan?.name || history.oldPlan?.name }}
              </td>
              <td class="p-3">{{ formatDate(history.startedAt) }}</td>
              <td class="p-3">{{ formatDate(history.endedAt) }}</td>
              <td class="p-3 capitalize">{{ history.action }}</td>
            </tr>

            <tr v-if="planHistory.length === 0">
              <td colspan="4" class="p-4 text-center text-gray-400">
                No history found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== UPGRADE MODAL ===== -->
    <div
      v-if="showUpgradeModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold mb-4">Upgrade Plan</h3>

        <select
          v-model="selectedPlanId"
          class="w-full border rounded-xl p-3 text-sm"
        >
          <option disabled value="">Pilih plan</option>
          <option
            v-for="plan in upgradePlans"
            :key="plan.id"
            :value="plan.id"
          >
            {{ plan.name }} – Rp {{ plan.price }}
          </option>
        </select>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showUpgradeModal = false"
            class="px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            @click="submitUpgrade"
            class="px-4 py-2 bg-blue-900 text-white rounded-xl text-sm"
          >
            Confirm Upgrade
          </button>
        </div>
      </div>
    </div>

    <!-- ===== DOWNGRADE MODAL ===== -->
      <div
        v-if="showDowngradeModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-2">Downgrade Plan</h3>
          <p class="text-sm text-gray-500 mb-4">
            Downgrade akan berlaku pada periode berikutnya
          </p>

          <select
            v-model="selectedPlanId"
            class="w-full border rounded-xl p-3 text-sm"
          >
            <option disabled value="">Pilih plan</option>
            <option
              v-for="plan in downgradePlans"
              :key="plan.id"
              :value="plan.id"
            >
              {{ plan.name }} – Rp {{ plan.price }}
            </option>
          </select>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showDowngradeModal = false"
              class="px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              @click="submitDowngrade"
              class="px-4 py-2 bg-red-600 text-white rounded-xl text-sm"
            >
              Confirm Downgrade
            </button>
          </div>
        </div>
      </div>
  </DashboardLayout>
</template>
