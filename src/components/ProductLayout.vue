<script setup>
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import ProductTabs from '@/components/reusable/ProductTabs.vue'
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'


</script>

<template>
  <DashboardLayout title="Product">
    <div class="bg-gray-50 min-h-screen space-y-6">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">
          Product
        </h1>
        <p class="text-slate-500 text-sm">
          Eksplorasi menu manajemen produk dibawah
        </p>
      </div>

      <ProductTabs />

      <!-- CHILD AKAN MASUK DI SINI -->
      <router-view />

    </div>
  </DashboardLayout>
</template>