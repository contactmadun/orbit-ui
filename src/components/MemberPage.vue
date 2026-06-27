<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/axios";
import DashboardLayout from "@/components/reusable/DashboardLayout.vue";
import AddUserDrawer from "@/components/reusable/AddCostumerDrawer.vue";
import MemberDetailDrawer from "@/components/reusable/MemberDetailDrawer.vue";
import { toast } from "vue-sonner";
import {
  Users,
  UsersIcon,
  ArrowUpRight,
  MoreVertical,
  Search,
} from "lucide-vue-next";
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
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const creatingMember = ref(false);
const members = ref([]);
const search = ref("");
const isEdit = ref(false);
const loadingMembers = ref(false);
const showAdd = ref(false);
const showDetail = ref(false);
const selectedMember = ref(null);
const currentPage = ref(1);
const limit = 5;
const totalPages = ref(1);
const totalMembers = ref(0);
let searchTimeout;

const visiblePages = computed(() => {
  const pages = [];

  let start = Math.max(currentPage.value - 2, 1);
  let end = Math.min(start + 4, totalPages.value);

  if (end - start < 4) {
    start = Math.max(end - 4, 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const fetchMembers = async () => {
  try {
    loadingMembers.value = true;

    const res = await api.get("/member", {
      params: {
        page: currentPage.value,
        limit,
        search: search.value,
      },
    });

    members.value = res.data.data;

    totalPages.value = res.data.pagination.totalPages;

    totalMembers.value = res.data.pagination.total;
  } catch (err) {
    console.error(err);
  } finally {
    loadingMembers.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;

  currentPage.value = page;

  fetchMembers();
};

const openAdd = () => {
  selectedMember.value = null;
  isEdit.value = false;
  showAdd.value = true;
};

const editMember = (member) => {
  selectedMember.value = member;
  isEdit.value = true;
  showAdd.value = true;
};

const openMemberDetail = (member) => {
  selectedMember.value = member;
  showDetail.value = true;
};

const handleSubmitMember = async (payload) => {
  try {
    creatingMember.value = true;

    if (isEdit.value) {
      await api.put(`/member/${payload.id}`, {
        outletId: payload.outletId,
        name: payload.name,
        phone: payload.phone,
        gender: payload.gender,
        ageRange: payload.ageRange,
        joined: payload.joined,
      });

      toast.success("Pelanggan berhasil diperbarui");
    } else {
      await api.post("/member", {
        outletId: payload.outletId,
        name: payload.name,
        phone: payload.phone,
        gender: payload.gender,
        ageRange: payload.ageRange,
        joined: payload.joined,
      });

      toast.success("Pelanggan berhasil ditambahkan");
    }

    showAdd.value = false;

    await fetchMembers();
  } catch (err) {
    console.error(err);

    toast.error(err?.response?.data?.message || "Terjadi kesalahan");
  } finally {
    creatingMember.value = false;
  }
};

const toggleStatus = async (member) => {
  try {
    await api.patch(`/member/${member.id}/status`);

    toast.success(
      member.status === "active"
        ? "Pelanggan berhasil dinonaktifkan"
        : "Pelanggan berhasil diaktifkan",
    );

    fetchMembers();
  } catch (err) {
    console.error(err);

    toast.error(
      err?.response?.data?.message || "Gagal mengubah status pelanggan",
    );
  }
};

onMounted(async () => {
  await fetchMembers();
});

watch(search, () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    currentPage.value = 1;

    fetchMembers();
  }, 400);
});
</script>

<template>
  <DashboardLayout title="Member Pelanggan">
    <div class="space-y-6">
      <!-- HEADER -->
      <div class="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 class="text-2xl font-semibold text-slate-800">
            Halaman Pelanggan
          </h1>
          <p class="text-slate-500 text-sm">Monitor semua pelanggan setiamu!</p>
        </div>
        <div class="flex flex-col items-end">
          <button
            @click="openAdd"
            class="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm"
          >
            <ArrowUpRight class="w-4 h-4" />
            Tambah Pelanggan
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-2 mt-6 items-start">
        <!-- LEFT: CARD AREA -->
        <div
          class="xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          <!-- CARD 1 -->
          <div class="bg-white border rounded-lg p-5">
            <div class="flex gap-2 items-center mb-2">
              <div
                class="w-8 h-8 bg-slate-100 text-blue-900 rounded-lg flex items-center justify-center"
              >
                <Users class="w-4 h-4" />
              </div>
              <p class="text-base font-semibold text-slate-800">
                Total Pelanggan
              </p>
            </div>

            <div v-if="loadingMembers">
              <Skeleton class="h-7 w-20 mb-2" />
              <Skeleton class="h-4 w-32" />
            </div>

            <div v-else class="flex items-center mb-2 gap-1">
              <h2 class="text-2xl text-slate-800 font-bold mt-1">
                {{ totalMembers }}
              </h2>
              <p class="text-xs text-green-800 mt-1">+15.9%</p>
            </div>
            <p class="text-sm text-slate-600">
              Data real time pelanggan yang tercatat di sistem.
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <!-- CARD HEADER -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-4">
            <div class="p-3 bg-slate-50 border rounded-2xl border-slate-100">
              <UsersIcon class="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">
                Detail Pelanggan
              </h3>
              <h3 class="text-sm text-slate-500">
                Pantau dan tingkatkan transaksi
              </h3>
            </div>
          </div>
          <div class="mt-4 relative max-w-sm">
            <Search class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />

            <input
              v-model="search"
              type="text"
              placeholder="Cari nama atau nomor telepon..."
              class="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- TABLE -->
        <div class="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table
            class="w-full text-sm border border-gray-200 rounded-xl overflow-hidden"
          >
            <!-- HEADER -->
            <thead class="bg-gray-50 text-slate-500 border-b border-gray-200">
              <tr class="divide-x divide-gray-200">
                <th class="p-3 text-left w-10">
                  <input type="checkbox" />
                </th>
                <th class="p-3 text-left font-medium">Nama</th>

                <th class="p-3 text-left font-medium">
                  <div class="flex items-center gap-2">
                    <Mail class="w-4 h-4 text-gray-400" />
                    Nomor Telepon
                  </div>
                </th>

                <th class="p-3 text-left font-medium">
                  <div class="flex items-center gap-2">
                    <CircleUserRound class="w-4 h-4 text-gray-400" />
                    Jenis Kelamin
                  </div>
                </th>

                <th class="p-3 text-left font-medium">
                  <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4 text-gray-400" />
                    Rentan Usia
                  </div>
                </th>

                <th class="p-3 text-left font-medium">Joined</th>

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
              <template v-if="loadingMembers">
                <tr
                  v-for="n in skeletonRows"
                  :key="'sk-' + n"
                  class="animate-pulse divide-x divide-gray-100"
                >
                  <td class="p-3">
                    <div class="h-4 w-4 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-32 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-40 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </td>
                  <td class="p-3">
                    <div class="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </td>
                </tr>
              </template>

              <!-- DATA -->
              <template v-else>
                <tr
                  v-for="member in members"
                  :key="member.id"
                  class="hover:bg-gray-50 transition-colors duration-150 divide-x divide-gray-200"
                >
                  <td class="p-3">
                    <input type="checkbox" />
                  </td>

                  <td class="p-3 font-medium text-gray-800">
                    {{ member.name }}
                  </td>

                  <td class="p-3 text-gray-500">
                    {{ member.phone || "-" }}
                  </td>

                  <td class="p-3 text-gray-500">
                    {{
                      member.gender === "L"
                        ? "Laki-laki"
                        : member.gender === "P"
                          ? "Perempuan"
                          : "-"
                    }}
                  </td>

                  <td class="p-3 text-gray-500">
                    {{ member.ageRange || "-" }}
                  </td>

                  <td class="p-3 text-gray-500">
                    {{ new Date(member.joined).toLocaleDateString("id-ID") }}
                  </td>

                  <td class="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <button
                          class="inline-flex items-center justify-center px-2 py-2 rounded-md border hover:bg-gray-50"
                        >
                          <MoreVertical class="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuItem @click="openMemberDetail(member)">
                          Detail Pelanggan
                        </DropdownMenuItem>

                        <DropdownMenuItem @click="editMember(member)">
                          Edit Pelanggan
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem @click="toggleStatus(member)">
                          {{
                            member.status === "active"
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </template>
            </tbody>
            <tbody v-if="!loadingMembers && members.length === 0">
              <tr>
                <td colspan="7" class="text-center py-10 text-slate-500">
                  Belum ada pelanggan yang terdaftar
                </td>
              </tr>
            </tbody>
          </table>

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
              :class="
                page === currentPage
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              "
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
    <AddUserDrawer
      :show="showAdd"
      :member="selectedMember"
      :isEdit="isEdit"
      @close="showAdd = false"
      @submit="handleSubmitMember"
    />
    <MemberDetailDrawer
      :show="showDetail"
      :member="selectedMember"
      @close="showDetail = false"
    />
  </DashboardLayout>
</template>
