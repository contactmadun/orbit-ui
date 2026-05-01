<script setup>
import api from '@/axios'
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import { ref, onMounted } from 'vue'


const billingHistory = ref([])
const loadingBilling = ref(false)

async function fetchBillingHistory() {
  loadingBilling.value = true
  try {
    const res = await api.get('/subscription-payment')

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

onMounted(() => {
  fetchBillingHistory()
})
</script>

<template>
  <DashboardLayout title="Detail Billing">

  </DashboardLayout>
</template>
