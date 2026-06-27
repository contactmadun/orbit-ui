<script setup>
import api from "@/axios";
import { ref, computed, onMounted, watch } from "vue";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const outlets = ref([]);
const props = defineProps({
  show: Boolean,
  member: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const defaultForm = () => ({
  name: "",
  phone: "",
  gender: "",
  ageRange: "",
  outletId: "",
  joined: new Date().toISOString().split("T")[0],
});

const form = ref(defaultForm());

const resetForm = () => {
  form.value = defaultForm();
};

/* filter account by outlet */
const filteredAccounts = computed(() => {
  if (!form.value.outletId) return [];

  return props.accounts.filter(
    (a) => String(a.outlet) === String(form.value.outletId),
  );
});

/* reset account when outlet change */
watch(
  () => form.value.outletId,
  () => {
    form.value.accountId = "";
  },
);

/* submit */
const submit = () => {
  emit("submit", {
    ...form.value,
    id: props.member?.id,
  });

  if (!props.isEdit) {
    resetForm();
  }
};

const close = () => {
  resetForm();
  emit("close");
};

onMounted(async () => {
  const res = await api.get("/outlet/tenant");
  outlets.value = res.data.data;
});

watch(
  () => [props.show, props.member],
  ([show]) => {
    if (!show) return;

    if (props.isEdit && props.member) {
      form.value = {
        name: props.member.name || "",
        phone: props.member.phone || "",
        gender: props.member.gender || "",
        ageRange: props.member.ageRange || "",
        outletId: String(props.member.outletId),
        joined: props.member.joined
          ? props.member.joined.substring(0, 10)
          : new Date().toISOString().split("T")[0],
      };
    } else {
      resetForm();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[9999] flex">
    <!-- overlay -->
    <div class="absolute inset-0 bg-black/30" @click="close"></div>

    <!-- drawer -->
    <div
      class="ml-auto w-full max-w-md h-full bg-white shadow-xl relative z-50 p-6 flex flex-col"
    >
      <!-- header -->
      <div class="mb-6">
        <h2 class="text-lg font-semibold">
          {{ isEdit ? "Edit Pelanggan" : "Tambah Pelanggan" }}
        </h2>

        <p class="text-sm text-slate-500">
          {{
            isEdit
              ? "Perbarui informasi pelanggan"
              : "Tambahkan pelanggan setiamu ke sistem"
          }}
        </p>
      </div>

      <!-- form -->
      <div class="space-y-4 flex-1 overflow-y-auto">
        <!-- nama -->
        <div>
          <label class="text-sm mb-1 block">Nama Pelanggan</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Masukkan nama pelanggan"
          />
        </div>

        <!-- nomor telepon -->
        <div>
          <label class="text-sm mb-1 block">Nomor Telepon</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <!-- jenis kelamin -->
        <div>
          <label class="text-sm mb-1 block">Jenis Kelamin</label>

          <Select v-model="form.gender">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>

            <SelectContent class="z-[20000]">
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- rentang usia -->
        <div>
          <label class="text-sm mb-1 block">Rentang Usia</label>

          <Select v-model="form.ageRange">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih rentang usia" />
            </SelectTrigger>

            <SelectContent class="z-[20000]">
              <SelectItem value="<17">Di bawah 17 Tahun</SelectItem>
              <SelectItem value="17-25">17 - 25 Tahun</SelectItem>
              <SelectItem value="26-35">26 - 35 Tahun</SelectItem>
              <SelectItem value="36-45">36 - 45 Tahun</SelectItem>
              <SelectItem value="46-55">46 - 55 Tahun</SelectItem>
              <SelectItem value="55+">Di atas 55 Tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- outlet -->
        <div>
          <label class="text-sm mb-1 block">Outlet Pendaftaran</label>

          <Select v-model="form.outletId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih outlet" />
            </SelectTrigger>

            <SelectContent class="z-[20000]">
              <SelectItem
                v-for="outlet in outlets"
                :key="outlet.id"
                :value="String(outlet.id)"
              >
                {{ outlet.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- joined -->
        <div>
          <label class="text-sm mb-1 block">Tanggal Bergabung</label>

          <input
            v-model="form.joined"
            type="date"
            class="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <!-- action -->
      <div class="pt-4 border-t flex gap-2">
        <button @click="close" class="flex-1 border rounded-lg py-2 text-sm">
          Batalkan
        </button>

        <button
          @click="submit"
          class="flex-1 bg-blue-900 text-white rounded-lg py-2 text-sm"
        >
          {{ isEdit ? "Simpan Perubahan" : "Tambah Data" }}
        </button>
      </div>
    </div>
  </div>
</template>
