<script setup>
import { computed, ref, onMounted, watch } from "vue";
import BaseOverlay from "./BaseOverlay.vue";
import api from "@/axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Trash2 } from "lucide-vue-next";
import { formatCurrency, handleCurrencyInput } from "@/helpers/numberFormatter";

/* props */
const props = defineProps({
  show: Boolean,
  cart: {
    type: Array,
    default: () => [],
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  payment: {
    type: Object,
    default: () => ({
      amountPaid: 0,
      method: "",
      status: "paid",
      memberId: 0,
      customerName: "",
      customerPhone: "",
      fundSource: "",
    }),
  },
  isInject: Boolean,
});
const openCustomer = ref(false);
const selectedCustomer = ref(null);
const selectedCustomerLabel = computed(() => {
  return selectedCustomer.value?.name || "Pilih pelanggan...";
});
const funds = ref([]);
const loadingFunds = ref(false);
const loading = ref(false);
const showCustomer = ref(false);
const showDiscount = ref(false);
const members = ref([]);
const memberSearch = ref("");
const loadingMembers = ref(false);

const selectCustomer = (member) => {
  selectedCustomer.value = member;

  updatePayment({
    memberId: member?.id || 0,
    customerName: member?.name || "",
    customerPhone: member?.phone || "",
  });

  openCustomer.value = false;
};

const discount = ref({
  type: "nominal", // atau percent
  value: 0,
});

const suggestedAmounts = computed(() => {
  const total = finalTotal.value || 0;

  if (!total) return [];

  const suggestions = new Set();

  // 🔥 nominal pembulatan umum
  const bases = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

  bases.forEach((base) => {
    const rounded = Math.ceil(total / base) * base;
    suggestions.add(rounded);
  });

  // 🔥 tambahan: exact + sedikit di atas
  suggestions.add(total);
  suggestions.add(Math.ceil(total / 1000) * 1000);

  return Array.from(suggestions)
    .filter((v) => v >= total)
    .sort((a, b) => a - b)
    .slice(0, 5); // ambil 5 terbaik
});

/* emit */
const emit = defineEmits(["close", "pay", "update:payment", "clear-cart"]);

const handleClearCart = () => {
  const confirmClear = confirm("Batalkan transaksi dan kosongkan keranjang?");

  if (!confirmClear) return;

  // 🔥 reset payment ke default
  emit("update:payment", {
    amountPaid: 0,
    memberId: 0,
    method: "",
    status: "paid",
    customerName: "",
    customerPhone: "",
    fundSource: "",
  });

  // 🔥 reset customer & discount lokal
  selectedCustomer.value = null;
  discount.value = {
    type: "nominal",
    value: 0,
  };

  // 🔥 kasih tahu parent untuk kosongkan cart
  emit("clear-cart");

  // 🔥 tutup drawer
  emit("close");
};

const handlePay = async () => {
  if (loading.value) return;

  // 🔥 VALIDASI
  const paymentSnapshot = { ...props.payment }; // 🔥 FIX

  if (props.isInject && !paymentSnapshot.fundSource) {
    alert("Sumber dana inject wajib dipilih");
    return;
  }

  if (paymentSnapshot.status === "paid") {
    if (!paymentSnapshot.method) {
      alert("Metode pembayaran wajib dipilih");
      return;
    }

    if ((paymentSnapshot.amountPaid || 0) < finalTotal.value) {
      alert("Uang bayar kurang");
      return;
    }
  }

  if (paymentSnapshot.status === "unpaid" && !paymentSnapshot.customerName) {
    alert("Nama pelanggan wajib diisi");
    return;
  }

  // 🔥 NORMALISASI DATA
  const payload = {
    cart: props.cart.map((item) => ({
      id: item.id,
      name: item.name,
      qty: Number(item.qty),
      price: Number(item.price),
      costPrice: Number(item.costPrice), // 🔥 FIX DISINI
      type: item.type,
    })),

    totalAmount: Number(props.totalAmount),
    isInject: props.isInject,

    payment: {
      status: props.payment.status,
      method: props.payment.method || null,
      amountPaid: Number(props.payment.amountPaid) || 0,
      memberId: props.payment.memberId || 0,
      customerName: props.payment.customerName || null,
      customerPhone: props.payment.customerPhone || null,
      fundSource: props.payment.fundSource || null,
    },

    change: change.value,
  };

  try {
    loading.value = true;

    console.log("SEND TO API:", payload);

    // 🔥 HIT API (sesuai router kamu: POST "/")
    const res = await api.post("/sale", payload);

    console.log("SUCCESS:", res.data);

    // ✅ UX
    alert("Transaksi berhasil");

    emit("close"); // tutup drawer
    emit("pay", res.data); // optional kirim balik ke parent
  } catch (err) {
    console.error(err);

    alert(err?.response?.data?.message || "Gagal melakukan transaksi");
  } finally {
    loading.value = false;
  }
};

const fetchFunds = async () => {
  loadingFunds.value = true;
  try {
    const res = await api.get("/fund/pos"); // 🔥 clean
    funds.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loadingFunds.value = false;
  }
};

const fetchMembers = async (keyword = "") => {
  try {
    loadingMembers.value = true;

    const res = await api.get("/member/pos", {
      params: {
        search: keyword,
      },
    });

    members.value = res.data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loadingMembers.value = false;
  }
};

/* computed */
const change = computed(() => {
  const paid = Number(props.payment?.amountPaid) || 0;
  const total = Number(finalTotal.value) || 0;
  return paid > total ? paid - total : 0;
});

const paymentMethods = computed(() => {
  const types = funds.value.map((f) => f.type);
  return [...new Set(types)];
});

const injectFunds = computed(() =>
  funds.value.filter(
    (f) => f.type !== "cash" && !f.isDefault, // 🔥 exclude kas utama
  ),
);

// const formatCurrency = (val) =>
//   new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//   }).format(val || 0);

/* methods */
const updatePayment = (newData = {}) => {
  emit("update:payment", {
    ...props.payment,
    ...newData,
  });
};

const finalTotal = computed(() => {
  let total = Number(props.totalAmount) || 0;

  if (discount.value.value > 0) {
    if (discount.value.type === "percent") {
      total -= (total * discount.value.value) / 100;
    } else {
      total -= discount.value.value;
    }
  }

  return total < 0 ? 0 : total;
});

onMounted(() => {
  fetchFunds();
});

let searchTimeout;

const onSearch = (value) => {
  memberSearch.value = value;

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    fetchMembers(value);
  }, 300);
};

watch(
  () => props.payment?.customerName,
  (val) => {
    if (!val) {
      selectedCustomer.value = null;
      return;
    }

    const found = members.value.find((m) => m.name === val);

    if (found) {
      selectedCustomer.value = found;
    }
  },
  { immediate: true },
);

watch(openCustomer, (open) => {
  if (open && members.value.length === 0) {
    fetchMembers();
  }
});
</script>

<template>
  <BaseOverlay :show="show" @close="emit('close')" />

  <transition name="slide">
    <div
      v-if="show"
      class="fixed right-0 top-0 z-[9999] h-full w-[420px] bg-white border-l shadow-xl flex flex-col"
    >
      <!-- HEADER -->
      <div class="p-5 border-b flex justify-between items-center">
        <div>
          <h2 class="text-lg font-semibold">Keranjang</h2>
          <p class="text-sm text-gray-500">{{ cart.length }} item</p>
        </div>

        <button
          @click="handleClearCart"
          class="text-red-500 hover:text-red-700 font-bold"
          title="Batalkan transaksi"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>

      <!-- BODY -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4">
        <div v-if="!cart.length" class="text-center text-gray-400 py-10">
          Belum ada item
        </div>

        <div
          v-for="item in cart"
          :key="item.id"
          class="flex justify-between border-b pb-2 text-sm"
        >
          <div>
            <p class="font-medium">{{ item.name }}</p>
            <p class="text-xs text-gray-400">
              {{ item.qty }} x {{ formatCurrency(item.price) }}
            </p>
          </div>

          <p class="font-medium">
            {{ formatCurrency(item.price * item.qty) }}
          </p>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="p-5 border-t space-y-4">
        <!-- STATUS -->
        <div>
          <p class="text-xs text-gray-500 mb-1">Status</p>
          <div class="flex gap-2">
            <button
              @click="
                updatePayment({
                  status: 'paid',
                  customerName: '',
                })
              "
              :class="[
                'flex-1 py-2 rounded-lg text-sm border',
                props.payment?.status === 'paid'
                  ? 'bg-green-700 text-white'
                  : 'bg-white',
              ]"
            >
              Lunas
            </button>

            <button
              @click="
                updatePayment({
                  status: 'unpaid',
                  amountPaid: 0,
                });
                showCustomer = true;
              "
              :class="[
                'flex-1 py-2 rounded-lg text-sm border',
                props.payment?.status === 'unpaid'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white',
              ]"
            >
              Belum Lunas
            </button>
          </div>
        </div>

        <!-- PAYMENT METHOD -->
        <div v-if="props.payment?.status === 'paid'">
          <p class="text-xs text-gray-500 mb-1">Metode Pembayaran</p>

          <Select
            :model-value="props.payment.method"
            @update:model-value="(value) => updatePayment({ method: value })"
          >
            <SelectTrigger class="w-full h-11 rounded-lg capitalize">
              <SelectValue placeholder="Pilih metode" />
            </SelectTrigger>

            <SelectContent position="popper" class="z-[9999]">
              <SelectItem
                v-for="type in paymentMethods"
                :key="type"
                :value="type"
                class="capitalize"
              >
                {{ type }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- CUSTOMER NAME (IF UNPAID) -->
        <div v-if="props.payment?.status === 'unpaid'" class="space-y-2"></div>

        <!-- FUND SOURCE (ONLY INJECT) -->
        <div v-if="props.isInject">
          <p class="text-xs text-gray-500 mb-1">Sumber Dana Inject</p>

          <Select
            :model-value="props.payment?.fundSource"
            @update:model-value="
              (value) => updatePayment({ fundSource: value })
            "
          >
            <SelectTrigger class="w-full h-11 rounded-lg">
              <SelectValue placeholder="Pilih sumber dana" />
            </SelectTrigger>

            <SelectContent position="popper" class="z-[9999]">
              <SelectItem
                v-for="f in injectFunds"
                :key="f.id"
                :value="String(f.id)"
              >
                {{ f.nameBank || f.nameAccount || f.type }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex gap-2">
          <!-- PELANGGAN -->
          <button
            @click="showCustomer = !showCustomer"
            class="flex-1 py-2 rounded-lg text-sm border"
            :class="showCustomer ? 'bg-blue-900 text-white' : 'bg-white'"
          >
            Pelanggan
          </button>

          <!-- DISKON -->
          <button
            @click="showDiscount = !showDiscount"
            class="flex-1 py-2 rounded-lg text-sm border"
            :class="showDiscount ? 'bg-purple-600 text-white' : 'bg-white'"
          >
            Diskon
          </button>
        </div>
        <!-- Form Pelanggan -->
        <div v-if="showCustomer" class="space-y-2">
          <p class="text-xs text-gray-500">
            Pilih pelanggan
            <span v-if="props.payment.status === 'unpaid'" class="text-red-500">
              *
            </span>
          </p>

          <Popover
            v-model:open="openCustomer"
            @update:open="(v) => console.log('Popover:', v)"
          >
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="openCustomer"
                class="w-full justify-between"
              >
                {{ selectedCustomerLabel }}

                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              class="w-[360px] p-0 z-[10000]"
              side="bottom"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Cari pelanggan..."
                  :model-value="memberSearch"
                  @update:model-value="onSearch"
                />

                <CommandEmpty> Tidak ada pelanggan. </CommandEmpty>

                <CommandGroup>
                  <CommandItem value="" @select="selectCustomer(null)">
                    Tanpa pelanggan
                  </CommandItem>

                  <CommandItem
                    v-for="member in members"
                    :key="member.id"
                    :value="member.name"
                    @select="selectCustomer(member)"
                  >
                    <Check
                      class="mr-2 h-4 w-4"
                      :class="[
                        selectedCustomer?.id === member.id
                          ? 'opacity-100'
                          : 'opacity-0',
                      ]"
                    />

                    <div class="flex flex-col">
                      <span>{{ member.name }}</span>

                      <span class="text-xs text-slate-500">
                        {{ member.phone }}
                      </span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <p
            v-if="
              props.payment.status === 'unpaid' && !props.payment.customerName
            "
            class="text-xs text-red-500"
          >
            Pilih pelanggan untuk transaksi piutang.
          </p>
        </div>

        <!-- Form Diskon -->
        <div v-if="showDiscount" class="space-y-2">
          <div class="flex gap-2">
            <!-- SELECT TYPE -->
            <select
              v-model="discount.type"
              class="w-24 border rounded-lg px-2 py-2 text-sm bg-white"
            >
              <option value="nominal">Rp</option>
              <option value="percent">%</option>
            </select>

            <!-- INPUT VALUE -->
            <input
              type="number"
              v-model="discount.value"
              :placeholder="
                discount.type === 'percent' ? '0 - 100%' : 'Nominal diskon'
              "
              class="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <!-- TOTAL -->
        <div class="flex justify-between text-sm">
          <span>Total</span>
          <span class="font-semibold">
            {{ formatCurrency(finalTotal) }}
          </span>
        </div>

        <!-- INPUT CASH -->
        <div v-if="props.payment?.status === 'paid'">
          <input
            :value="formatCurrency(props.payment?.amountPaid) ?? ''"
            @input="
              handleCurrencyInput($event, (value) => {
                updatePayment({
                  amountPaid: value,
                });
              })
            "
            type="text"
            inputmode="numeric"
            class="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <!-- SUGGESTED CASH -->
        <div
          v-if="props.payment?.status === 'paid'"
          class="flex flex-wrap gap-2"
        >
          <button
            v-for="amt in suggestedAmounts"
            :key="amt"
            @click="updatePayment({ amountPaid: amt })"
            class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
          >
            {{ formatCurrency(amt) }}
          </button>
        </div>

        <!-- CHANGE -->
        <div
          v-if="props.payment?.status === 'paid'"
          class="flex justify-between text-sm"
        >
          <span>Kembalian</span>
          <span class="text-green-600 font-semibold">
            {{ formatCurrency(change) }}
          </span>
        </div>

        <!-- BUTTON -->
        <button
          @click="handlePay"
          :disabled="
            props.payment?.status === 'paid'
              ? (props.payment?.amountPaid || 0) < finalTotal
              : !props.payment?.customerName
          "
          class="w-full py-2 rounded-lg text-white transition"
          :class="
            props.payment?.status === 'paid'
              ? 'bg-blue-900 hover:bg-blue-800'
              : 'bg-orange-500 hover:bg-orange-400'
          "
        >
          {{ props.payment?.status === "paid" ? "Bayar" : "Simpan Piutang" }}
        </button>

        <button @click="emit('close')" class="w-full border py-2 rounded-lg">
          Tutup
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
