<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'

const route = useRoute()
const outlet = ref(null)
const loading = ref(false)

async function fetchOutletDetail() {
  loading.value = true
  try {
    const res = await api.get(`/outlet/${route.params.id}`)
    outlet.value = res.data.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOutletDetail()
})
</script>

<template>
  <DashboardLayout title="Dashboard POS">
    <div class="p-6 space-y-8 bg-gray-50 min-h-screen">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold">Detail Outlet</h1>
        <p class="text-gray-500">
          Temukan informasi lengkap mengenai outletmu
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-gray-500">
        Memuat data outlet...
      </div>

      <!-- Main Content -->
      <div v-else-if="outlet" class="space-y-8">

        <!-- ========================= -->
        <!-- 1. Informasi Utama Outlet -->
        <!-- ========================= -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-semibold text-gray-800">
                {{ outlet.name }}
              </h2>
              <p class="text-gray-500 mt-1">
                Kode Outlet: {{ outlet.code }}
              </p>
            </div>

            <span class="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              ● {{ outlet.status }}
            </span>
          </div>
        </div>

        <!-- ========================= -->
        <!-- 2. Informasi Detail -->
        <!-- ========================= -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <h3 class="text-lg font-semibold mb-6">Informasi Detail</h3>

          <div class="grid grid-cols-2 gap-y-6 gap-x-10 text-sm">

            <div>
              <p class="text-gray-400">Alamat</p>
              <p class="font-medium text-gray-700">
                {{ outlet.address || 'Data belum tersedia' }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Nomor Telepon</p>
              <p class="font-medium text-gray-700">
                {{ outlet.phoneNumber || 'Data belum tersedia' }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Jam Operasional</p>
              <p class="font-medium text-gray-700">
                {{ outlet.openingTime || '-' }} - {{ outlet.closingTime || '-' }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Latitude</p>
              <p class="font-medium text-gray-700">
                {{ outlet.latitude || 'Data belum tersedia' }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Longitude</p>
              <p class="font-medium text-gray-700">
                {{ outlet.longitude || 'Data belum tersedia' }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Dibuat Pada</p>
              <p class="font-medium text-gray-700">
                {{ new Date(outlet.createdAt).toLocaleString() }}
              </p>
            </div>

          </div>
        </div>

        <!-- ========================= -->
        <!-- 3. Riwayat Transaksi -->
        <!-- ========================= -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <h3 class="text-lg font-semibold mb-4">
            Riwayat Transaksi Terakhir
          </h3>

          <div class="text-center text-gray-400 py-10">
            Data transaksi belum tersedia
          </div>
        </div>

        <!-- ========================= -->
        <!-- 4. Insight & Analytics -->
        <!-- ========================= -->
        <div class="bg-white rounded-2xl shadow-sm border p-6">
          <h3 class="text-lg font-semibold mb-4">
            Insight & Analitik Toko
          </h3>

          <div class="text-center text-gray-400 py-12">
            Grafik dan insight toko akan ditampilkan di sini
            <br />
            (Data belum tersedia)
          </div>
        </div>

      </div>

      <!-- Jika Tidak Ada Data -->
      <div v-else class="text-gray-400">
        Outlet tidak ditemukan
      </div>

    </div>
  </DashboardLayout>
</template>