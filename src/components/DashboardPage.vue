<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import api from '../axios'

const userStore = useUserStore()
const sidebarOpen = ref(true)
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r hidden lg:flex flex-col">
      <div class="h-16 flex items-center px-6 font-bold text-blue-600 text-xl">
        TASKORA
      </div>
      <nav class="flex-1 px-4 space-y-1">
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">Dashboard</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">POS</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">WhatsApp Gateway</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Broadcast</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Kirim Uang</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Top Up Koin</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Riwayat Transaksi</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Riwayat Koin</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Mutasi Bank</a>
        <a class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Integrasi Akun</a>
      </nav>
      <div class="p-4">
        <button class="w-full py-2 text-sm rounded-lg border text-red-500">Keluar Aplikasi</button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Navbar -->
      <header class="h-16 bg-white border-b flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <h1 class="text-lg font-semibold">Dashboard</h1>
          <input
            type="text"
            placeholder="Cari transaksi..."
            class="hidden md:block px-4 py-2 border rounded-lg text-sm"
          />
        </div>
        <div class="flex items-center gap-4">
          <button class="text-sm border px-4 py-2 rounded-lg">Integrasi API</button>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg">+ Isi Ulang Koin</button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">M</div>
            <span class="text-sm font-medium">Maulana Rizki</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6 space-y-6">
        <div>
          <h2 class="text-2xl font-semibold">Dashboard</h2>
          <p class="text-gray-500">Selamat datang kembali, <span class="text-blue-600 font-medium">Maulana Rizki Ilhami</span> 👋</p>
        </div>

        <!-- Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Saldo -->
          <div class="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6">
            <p class="text-sm opacity-80">SALDO KOIN</p>
            <h3 class="text-4xl font-bold mt-2">100</h3>
            <p class="text-sm mt-1">Siap digunakan untuk transaksi</p>
            <div class="mt-4 flex justify-between items-center">
              <span class="text-sm">Estimasi: 100 transaksi</span>
              <button class="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm">Top Up</button>
            </div>
          </div>

          <!-- Status Akun -->
          <div class="bg-white rounded-2xl p-6 border">
            <span class="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">TERVERIFIKASI</span>
            <h3 class="text-lg font-semibold mt-4">Status Akun</h3>
            <p class="text-sm text-gray-500 mt-2">Akun Anda dalam kondisi prima. Semua fitur pembayaran aktif.</p>
            <div class="mt-4 text-sm text-green-600">✔ Email terverifikasi</div>
          </div>

          <!-- Quick Start -->
          <div class="bg-gray-900 text-white rounded-2xl p-6">
            <h3 class="text-lg font-semibold">Mulai Cepat</h3>
            <ul class="mt-4 space-y-3 text-sm">
              <li>1. Isi Saldo Koin</li>
              <li>2. Dapatkan API Key</li>
              <li class="opacity-50">3. Mulai Transaksi</li>
            </ul>
            <button class="mt-6 w-full bg-white text-gray-900 py-2 rounded-lg text-sm">Baca Dokumentasi</button>
          </div>
        </div>

        <!-- Aktivitas -->
        <div class="bg-white rounded-2xl p-6 border">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold">Aktivitas Terbaru</h3>
            <a class="text-blue-600 text-sm">Lihat Semua</a>
          </div>
          <table class="w-full text-sm">
            <thead class="text-gray-400">
              <tr>
                <th class="text-left py-2">Aktivitas</th>
                <th class="text-left py-2">Waktu</th>
                <th class="text-left py-2">Nominal</th>
                <th class="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t">
                <td class="py-3">Pembelian Koin</td>
                <td>10 Jan</td>
                <td>Rp 50.523</td>
                <td><span class="px-2 py-1 text-xs rounded-full bg-gray-100">EXPIRED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>
