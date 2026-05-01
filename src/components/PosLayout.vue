<script setup>
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
</script>

<template>
  <DashboardLayout title="POS">
    <div class="bg-gray-50 min-h-screen space-y-6">
      <!-- Header -->
      <!-- <div>
        <h1 class="text-2xl font-semibold text-slate-800">Product</h1>
        <p class="text-slate-500 text-sm">
          Eksplorasi menu manajemen produk dibawah
        </p>
      </div> -->

      <!-- CHILD AKAN MASUK DI SINI -->
      <router-view />
    </div>
  </DashboardLayout>
</template>
