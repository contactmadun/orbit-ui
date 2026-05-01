<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { Crown } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import api from '@/axios'
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import BaseOverlay from '@/components/reusable/BaseOverlay.vue'
import SlidePanel from '@/components/reusable/SlidePanel.vue'

const router = useRouter()
const outlets = ref([])
const loading = ref(false)
const showForm = ref(false)
const selectedOutlet = ref(null)
const isCreateMode = ref(false)
const saving = ref(false)
const maxOutlet = ref(0)
const totalOutlet = ref(0)
const isLimitReached = ref(false)
const planName = ref('')

function getCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Browser tidak mendukung Geolocation')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.latitude = position.coords.latitude
      form.longitude = position.coords.longitude
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert('Izin lokasi ditolak')
          break
        case error.POSITION_UNAVAILABLE:
          alert('Lokasi tidak tersedia')
          break
        case error.TIMEOUT:
          alert('Permintaan lokasi timeout')
          break
        default:
          alert('Terjadi kesalahan saat mengambil lokasi')
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  )
}

function safe(val) {
  return val ?? '-'
}

function getInitial(name) {
  return name ? name.substring(0, 2).toUpperCase() : '-'
}

async function fetchOutlets() {
  loading.value = true
  try {
    const res = await api.get('/outlet')

    outlets.value = res.data.data

    maxOutlet.value = res.data.maxOutlet
    totalOutlet.value = res.data.totalOutlet
    isLimitReached.value = res.data.isLimitReached
    planName.value = res.data.plan

  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function viewStore(outlet) {
  router.push(`/detail-outlet/${outlet.id}`)
}

const showEdit = ref(false)

function openCreate() {
  isCreateMode.value = true
  selectedOutlet.value = null
  resetForm()
  showForm.value = true
}

const form = reactive({
  code: '',
  name: '',
  status: 'active',
  latitude: '',
  longitude: '',
  openingTime: '',
  closingTime: '',
  address: '',
  phoneNumber: ''
})

function resetForm() {
  form.code = ''
  form.name = ''
  form.status = 'active'
  form.latitude = ''
  form.longitude = ''
  form.openingTime = ''
  form.closingTime = ''
  form.address = ''
  form.phoneNumber = ''
}

function openEdit(outlet) {
  isCreateMode.value = false
  selectedOutlet.value = outlet
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selectedOutlet.value = null
  isCreateMode.value = false
}

watch(selectedOutlet, (val) => {
  if (val) {
    form.code = val.code ?? ''
    form.name = val.name ?? ''
    form.status = val.status ?? 'active'
    form.latitude = val.latitude ?? ''
    form.longitude = val.longitude ?? ''
    form.openingTime = val.openingTime ?? ''
    form.closingTime = val.closingTime ?? ''
    form.address = val.address ?? ''
    form.phoneNumber = val.phoneNumber ?? ''
  }
})

async function saveOutlet() {
  saving.value = true

  try {
    if (isCreateMode.value) {
      await api.post('/outlet', form)
    } else if (selectedOutlet.value) {
      await api.put(`/outlet/${selectedOutlet.value.id}`, form)
    }

    await fetchOutlets()
    closeForm()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchOutlets()
})
</script>

<template>
  <DashboardLayout title="Dashboard POS">
    <div class="space-y-6 bg-gray-50 min-h-screen">

      <!-- Header -->
      <div class="flex justify-between items-start">
        <h1 class="text-2xl font-semibold">Outlet POS</h1>
        <div class="flex flex-col items-end">
          <button
            @click="!isLimitReached && openCreate()"
            :disabled="isLimitReached"
            class="flex items-center gap-2 px-3 py-1 text-sm border rounded-md transition-all"
            :class="isLimitReached
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'bg-white hover:bg-gray-100 border-gray-300'"
          >
            Add Outlet

            <Crown
              v-if="isLimitReached"
              class="w-4 h-4 text-yellow-500"
            />
          </button>

          <p
            v-if="isLimitReached"
            class="text-xs text-gray-400 mt-1 text-right"
          >
            Plan {{ planName }} hanya mendukung maksimal {{ maxOutlet }} Outlet.
          </p>
        </div>
      </div>
      <p class="-mt-4 text-gray-500">
        Daftar outlet yang terdaftar di akunmu
      </p>

      <!-- Loading -->
      <div v-if="loading" class="text-gray-500">
        Loading outlet...
      </div>

      <!-- Empty -->
      <div
        v-else-if="outlets.length === 0"
        class="bg-white rounded-xl p-6 text-center text-gray-400"
      >
        Belum ada outlet terdaftar
      </div>

      <!-- Cards -->
      <div v-else class="flex flex-wrap gap-6">

        <div
          v-for="outlet in outlets"
          :key="outlet.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-95"
        >
          <!-- Top Section -->
          <div class="flex justify-between items-start">
            <div class="flex gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <span class="text-blue-900 font-bold">
                  {{ getInitial(outlet.name) }}
                </span>
              </div>

              <div>
                <h2 class="font-semibold text-gray-800">
                  {{ safe(outlet.name) }}
                </h2>
              </div>
            </div>

            <!-- Status -->
            <span class="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              ● Active
            </span>
          </div>

          <!-- Info Section -->
          <div class="grid grid-cols-2 gap-y-4 gap-x-6 mt-6 text-sm">

            <div>
              <p class="text-gray-400">Working Hours:</p>
              <p class="font-medium text-gray-700">
                {{ safe(outlet.openingTime) }} - {{ safe(outlet.closingTime) }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Performance:</p>
              <p class="font-medium text-blue-900">
                {{ safe(outlet.performanceLabel) }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Address:</p>
              <p class="font-medium text-gray-700 truncate">
                {{ safe(outlet.address) }}
              </p>
            </div>

            <div>
              <p class="text-gray-400">Phone:</p>
              <p class="font-medium text-gray-700">
                {{ safe(outlet.phoneNumber) }}
              </p>
            </div>

          </div>

          <!-- Buttons -->
          <div class="flex gap-3 mt-6">
            <button
              @click="viewStore(outlet)"
              class="flex-1 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              View Store
            </button>

            <button
              @click="openEdit(outlet)"
              class="flex-1 py-2 text-sm font-medium bg-blue-800 text-white rounded-lg hover:bg-blue-900"
            >
              Edit Store Info
            </button>
          </div>
        </div>
      </div>
      <BaseOverlay :show="showForm" @close="closeForm" />
        <SlidePanel
          :show="showForm"
          :title="isCreateMode ? 'Add Outlet' : 'Edit Outlet'"
          width="w-[420px]"
          @close="closeForm"
        >
        <div class="flex flex-col h-full">
          <div class="flex-1 space-y-5">
            <!-- Outlet Code -->
            <div>
              <label class="text-sm text-gray-500">Outlet Code</label>
              <input
                v-model="form.code"
                type="text"
                readonly
                class="w-full mt-1 bg-gray-100 border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <!-- Name -->
            <div>
              <label class="text-sm text-gray-500">
                Outlet Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- Status -->
            <div>
              <label class="text-sm text-gray-500">Status</label>
              <select
                v-model="form.status"
                class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <!-- Phone -->
            <div>
              <label class="text-sm text-gray-500">Phone Number</label>
              <input
                v-model="form.phoneNumber"
                type="text"
                placeholder="08xxxxxxxxxx"
                class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <!-- Working Hours -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-500">Opening Time</label>
                <input
                  v-model="form.openingTime"
                  type="time"
                  class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label class="text-sm text-gray-500">Closing Time</label>
                <input
                  v-model="form.closingTime"
                  type="time"
                  class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <!-- Latitude & Longitude -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-500">Latitude</label>
                <input
                  v-model="form.latitude"
                  type="number"
                  step="any"
                  class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label class="text-sm text-gray-500">Longitude</label>
                <input
                  v-model="form.longitude"
                  type="number"
                  step="any"
                  class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <!-- Get Location Button -->
            <button
              type="button"
              @click="getCurrentLocation"
              class="w-full py-2 text-sm bg-gray-100 border rounded-lg hover:bg-gray-200"
            >
              📍 Ambil Lokasi Saat Ini
            </button>

            <!-- Address -->
            <div>
              <label class="text-sm text-gray-500">Address</label>
              <textarea
                v-model="form.address"
                rows="3"
                class="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

          </div>

          <!-- Footer -->
          <div class="pt-5 border-t mt-6 flex gap-3">
            <button
              @click="closeEdit"
              class="flex-1 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              @click="saveOutlet"
              :disabled="saving || !form.name"
              class="flex-1 py-2 text-sm bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : (isCreateMode ? 'Create Outlet' : 'Save Changes') }}
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  </DashboardLayout>
</template>