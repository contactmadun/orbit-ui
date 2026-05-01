<script setup>
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios'

const router = useRouter()
const outlets = ref([])

const form = ref({
  name: '',
  email: '',
  phoneNumber: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

async function submitForm() {
  try {
    loading.value = true
    errorMessage.value = ''

    await api.post('/users/user-outlet', form.value)

    router.push('/user')
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Terjadi kesalahan'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const res = await api.get('/outlet/tenant')
  outlets.value = res.data.data
})
</script>

<template>
  <DashboardLayout title="Tambah User">
    <div class="p-6 bg-gray-50 min-h-screen">

      <div class="max-w-xl bg-white p-6 rounded-2xl border border-gray-200">

        <h2 class="text-xl font-semibold mb-6">
          Tambah User Baru
        </h2>

        <div v-if="errorMessage" class="mb-4 text-sm text-red-500">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">

          <div>
            <label class="text-sm text-gray-600">Full Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="text-sm text-gray-600">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="text-sm text-gray-600">Phone Number</label>
            <input
              v-model="form.phoneNumber"
              type="text"
              class="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="text-sm text-gray-600">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          <select
            v-model="form.outletId"
            class="w-full mt-1 px-3 py-2 border rounded-lg"
            >
            <option disabled value="">Pilih Outlet</option>
            <option
                v-for="outlet in outlets"
                :key="outlet.id"
                :value="outlet.id"
            >
                {{ outlet.name }}
            </option>
          </select>

          <div class="flex justify-end gap-2 pt-4">
            <button
              type="button"
              @click="router.push('/user')"
              class="px-4 py-2 text-sm border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm bg-blue-900 text-white rounded-lg"
            >
              {{ loading ? 'Saving...' : 'Save User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>