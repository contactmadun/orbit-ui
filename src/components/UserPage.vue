<script setup>
import DashboardLayout from '@/components/reusable/DashboardLayout.vue'
import { UsersIcon, Mail, CircleUserRound, Calendar, Settings, Crown, MoreVertical, Loader2 } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { ref, computed, onMounted } from 'vue'
import api from '@/axios'

/* -----------------------
   CONFIG
------------------------*/
const limit = 5
const currentPage = ref(1)
const loadingUsers = ref(false)
const skeletonRows = 5
const maxUser = ref(0)
const totalCashier = ref(0)
const isLimitReached = ref(false)
const planName = ref('')
const allUsers = ref([])
const selectedUser = ref(null)
const showDeleteDialog = ref(false)
const showOutletModal = ref(false)
const outlets = ref([]) // pastikan ini sudah di fetch
const selectedOutletId = ref(null)
const loadingUserId = ref(null)
const MIN_LOADING_TIME = 500


function openOutletModal(user) {
  selectedUser.value = user
  selectedOutletId.value = null
  showOutletModal.value = true
}

async function fetchOutlet(){
  try {
    const res = await api.get('/outlet/tenant')
    outlets.value = res.data.data
  } catch (error) {
    console.log(error);
  }
}

async function fetchUsers() {
  loadingUsers.value = true

  const startTime = Date.now()

  try {
    const res = await api.get('/users/tenant')

    allUsers.value = res.data.data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status === 'active' ? 'Active' : 'Inactive',
      joined: user.createdAt
        ? new Date(user.createdAt).toISOString().slice(0, 10)
        : '-'
    }))

    maxUser.value = res.data.maxUser
    totalCashier.value = res.data.totalCashier
    isLimitReached.value = res.data.isLimitReached
    planName.value = res.data.plan

  } catch (err) {
    console.error(err)
  } finally {
    const elapsed = Date.now() - startTime
    const remaining = MIN_LOADING_TIME - elapsed

    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining))
    }

    loadingUsers.value = false
  }
}

function handleDelete(user) {
  selectedUser.value = user
  showDeleteDialog.value = true
}

function handleChangeOutlet(user) {
  selectedUser.value = user
  selectedOutletId.value = user.outletId
  showOutletModal.value = true
}

function openDeleteDialog(user) {
  selectedUser.value = user
  showDeleteDialog.value = true
}

async function confirmChangeOutlet() {
  try {
    await api.patch(`/users/${selectedUser.value.id}/change-outlet`, {
      outletId: selectedOutletId.value
    })
    showOutletModal.value = false
    fetchUsers()
  } catch (err) {
    console.error(err)
  }
}

async function confirmDelete() {
  try {
    await api.delete(`/users/${selectedUser.value.id}`)
    showDeleteDialog.value = false
    fetchUsers()
  } catch (err) {
    console.error(err)
  }
}

async function handleToggleStatus(user) {
  try {
    loadingUserId.value = user.id

    const startTime = Date.now()

    const { data } = await api.patch(`/users/${user.id}/toggle-status`)

    const elapsed = Date.now() - startTime
    const remaining = MIN_LOADING_TIME - elapsed

    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining))
    }
    await fetchUsers()
    user.status = data.status

  } catch (err) {
    console.error(err)
  } finally {
    loadingUserId.value = null
  }
}


/* -----------------------
   Pagination Logic
------------------------*/
const totalPages = computed(() => {
  return Math.ceil(allUsers.value.length / limit)
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * limit
  const end = start + limit
  return allUsers.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i)
  }
  return pages
})

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

onMounted(() => {
  fetchUsers()
  fetchOutlet()
})

</script>

<template>
  <DashboardLayout title="Pengguna">
    <div class="space-y-6 bg-gray-50 min-h-screen">

      <!-- HEADER -->
      <div class="flex items-start justify-between">
        <h1 class="text-2xl font-semibold">User Management</h1>

        <div class="flex flex-col items-end">
          <button
            @click="!isLimitReached && $router.push('/user/create-user-outlet')"
            :disabled="isLimitReached"
            class="flex items-center gap-2 px-3 py-1 text-sm border rounded-md transition-all"
            :class="isLimitReached
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
              : 'bg-white hover:bg-gray-100 border-gray-300'"
          >
            Add User

            <Crown
              v-if="isLimitReached"
              class="w-4 h-4 text-yellow-500"
            />
          </button>

          <p
            v-if="isLimitReached"
            class="text-xs text-gray-400 mt-1 text-right"
          >
            Plan {{ planName }} hanya mendukung maksimal {{ maxUser }} user.
          </p>
        </div>
      </div>

      <!-- CARD WRAPPER (same as billing) -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200">

        <!-- CARD HEADER -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-4">
            <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
              <UsersIcon class="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">
                Latest Users
              </h3>
              <h3 class="text-sm text-slate-500">
                Manage team members & access role
              </h3>
            </div>
          </div>
        </div>

        <!-- TABLE -->
        <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table class="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
    
            <!-- HEADER -->
            <thead class="bg-gray-50 text-slate-500 border-b border-gray-200">
              <tr class="divide-x divide-gray-200">
                <th class="p-3 text-left w-10">
                  <input type="checkbox" />
                </th>
                <th class="p-3 text-left font-medium">
                  Full Name
                </th>

                <th class="p-3 text-left font-medium">
                  <div class="flex items-center gap-2">
                    <Mail class="w-4 h-4 text-gray-400" />
                    Email
                  </div>
                </th>

                <th class="p-3 text-left font-medium">
                  <div class="flex items-center gap-2">
                    <CircleUserRound class="w-4 h-4 text-gray-400" />
                    Role
                  </div>
                </th>

                <th class="p-3 text-left font-medium">
                  <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4 text-gray-400" />
                    Joined
                  </div>
                </th>

                <th class="p-3 text-left font-medium">
                  Status
                </th>

                <th class="p-3 text-left font-medium">
                  <div class="flex items-center gap-2">
                    <Settings class="w-4 h-4 text-gray-400" />
                    Action
                  </div>
                </th>
              </tr>
            </thead>

            <!-- BODY -->
            <tbody class="divide-y divide-gray-200">

              <!-- Skeleton -->
              <template v-if="loadingUsers">
                <tr
                  v-for="n in skeletonRows"
                  :key="'sk-' + n"
                  class="animate-pulse divide-x divide-gray-100"
                >
                  <td class="p-3"><div class="h-4 w-4 bg-gray-200 rounded"></div></td>
                  <td class="p-3"><div class="h-4 w-32 bg-gray-200 rounded"></div></td>
                  <td class="p-3"><div class="h-4 w-40 bg-gray-200 rounded"></div></td>
                  <td class="p-3"><div class="h-4 w-24 bg-gray-200 rounded"></div></td>
                  <td class="p-3"><div class="h-4 w-20 bg-gray-200 rounded"></div></td>
                  <td class="p-3"><div class="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                  <td class="p-3"><div class="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                </tr>
              </template>

              <!-- DATA -->
              <template v-else>
                <tr
                  v-for="user in paginatedUsers"
                  :key="user.id"
                  class="hover:bg-gray-50 transition-colors duration-150 divide-x divide-gray-200"
                >
                  <td class="p-3">
                    <input type="checkbox" />
                  </td>

                  <td class="p-3 font-medium text-gray-800">
                    {{ user.name }}
                  </td>

                  <td class="p-3 text-gray-500">
                    {{ user.email }}
                  </td>

                  <td class="p-3 text-gray-500">
                    {{ user.role }}
                  </td>

                  <td class="p-3 text-gray-500">
                    {{ user.joined }}
                  </td>

                  <td class="p-3">
                    <div
                      class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-gray-200 bg-white transition-all duration-300"
                    >
                      
                      <!-- Dot ATAU Spinner -->
                      <template v-if="loadingUserId === user.id">
                        <Loader2 class="w-3 h-3 animate-spin text-gray-500" />
                      </template>

                      <template v-else>
                        <span
                          class="w-2 h-2 rounded-full"
                          :class="
                            user.status === 'Active'
                              ? 'bg-green-700'
                              : 'bg-red-700'
                          "
                        />
                      </template>

                      <!-- Text -->
                      <span class="text-xs text-gray-500">
                        {{ user.status }}
                      </span>

                    </div>
                  </td>

                  <td class="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <div
                          class="inline-flex items-center justify-center px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-all"
                        >
                          <MoreVertical class="w-4 h-4 text-gray-600" />
                        </div>
                      </DropdownMenuTrigger>

                     <DropdownMenuContent align="end" class="w-44">

                        <!-- STATUS TOGGLE -->
                        <DropdownMenuItem
                          class="cursor-pointer"
                          @click="handleToggleStatus(user)"
                        >
                          {{ user.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan' }}
                        </DropdownMenuItem>

                        <!-- CHANGE OUTLET -->
                        <DropdownMenuItem
                          class="cursor-pointer"
                          :disabled="outlets.length <= 1"
                          @click="openOutletModal(user)"
                        >
                          Ubah Outlet
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <!-- DELETE -->
                        <DropdownMenuItem
                          class="text-red-600 focus:text-red-600 cursor-pointer"
                          @click="openDeleteDialog(user)"
                        >
                          Hapus User
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </template>

            </tbody>
          </table>

          <Dialog v-model:open="showOutletModal">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ubah Outlet</DialogTitle>
              </DialogHeader>

              <select
                v-model="selectedOutletId"
                class="w-full mt-4 border rounded-md px-3 py-2"
              >
                <option
                  v-for="outlet in outlets"
                  :key="outlet.id"
                  :value="outlet.id"
                >
                  {{ outlet.name }}
                </option>
              </select>

              <DialogFooter class="mt-4">
                <button
                  class="px-4 py-2 border rounded-md"
                  @click="showOutletModal = false"
                >
                  Batal
                </button>

                <button
                  class="px-4 py-2 bg-blue-900 text-white rounded-md"
                  @click="confirmChangeOutlet"
                >
                  Simpan
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog v-model:open="showDeleteDialog">
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  class="bg-red-600 hover:bg-red-700"
                  @click="confirmDelete"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <!-- PAGINATION -->
          <div class="flex justify-center items-center gap-1 mt-6 mb-5 text-sm">

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
              class="w-8 h-8 rounded-md border text-xs font-semibold transition"
              :class="page === currentPage
                ? 'bg-blue-900 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-100'"
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