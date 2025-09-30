<script setup>
import { ref, computed, onMounted } from "vue"
import { Check, ChevronsUpDown, Search } from "lucide-vue-next"
import Button from './ui/button/Button.vue'
import { RouterLink } from "vue-router"
import { useUserStore } from '@/stores'
import { useCartStore } from "@/stores/cart"
import { useRouter } from 'vue-router'
import Label from './ui/label/Label.vue'
import { Switch } from "@/components/ui/switch"
import Input from './ui/input/Input.vue'
import api from '../axios'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from "@/components/ui/number-field"
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxAnchor,
  ComboboxTrigger
} from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"


const tabs = ["Transaksi Produk", "Transaksi Manual", "Transfer", "Tarik Tunai"]
const activeTab = ref("Transaksi Produk")

// ambil store
const cartStore = useCartStore()
const userStore = useUserStore();
const router = useRouter();

// --- form transaksi manual
const retailPrice = ref("")
const purchasePrice = ref("")
const note = ref("")
const funds = ref([]) // isi dari sumber dana
const selectedFund = ref(null)

// --- tarik tunai
const nominalWd = ref("")
const nominalTf = ref("")
const nominalAdmin = ref("")
const nominalAdminBank = ref("")
const adminInside = ref(false) // pakai v-model untuk Switch

async function getActiveSession() {
  try {
    const res = await api.get(`/cashier/session/${userStore.storeId}`)
    // if (!res.ok) throw new Error("Gagal fetch active session")
    const data = res.data; 
    console.log(res.data);

    if (data && data.id) {
      cartStore.cashierSessionId = data.id
      console.log("Active cashier session set:", data.id)
    } else {
      console.warn("Tidak ada active session ditemukan")
    }
  } catch (err) {
    console.error("Error getActiveSession:", err)
  }
}


// ambil fund except default
async function getExceptDefaultFund() {
  try {
    const res = await api.get(`/fund/except-default/${userStore.storeId}`)
      funds.value = res.data.map(f => ({label: f.name, value: f.id}))
  } catch (err) {
    console.error("Error getDefaultFund:", err)
  }
}

// ambil fund default
async function getDefaultFund() {
  try {
    const res = await api.get(`/fund/default/${userStore.storeId}`)
    if (res.data && res.data.id) {
      defaultFundId.value = res.data.id
      console.log("Default fund source:", res.data)
    } else {
      console.warn("Tidak ada fund default ditemukan")
    }
  } catch (err) {
    console.error("Error getDefaultFund:", err)
  }
}

// produk yg ada di keranjang
const cartProducts = computed(() => {
  return cartStore.products.filter(p => cartStore.cart[p.id])
})

// cek apakah ada produk inject di keranjang
const hasInjectProduct = computed(() => {
  return cartProducts.value.some(p => p.typeProduct === "inject")
})

// --- tambahan: catatan & status
const catatan = ref("")
const statusTransaksi = ref("Lunas") // default Lunas
const defaultFundId = ref(null) // fund source default dari backend

// fungsi update jumlah
function updateQty(id, val) {
  if (val <= 0) {
    const newCart = { ...cartStore.cart }
    delete newCart[id]
    cartStore.cart = newCart
  } else {
    cartStore.cart = { ...cartStore.cart, [id]: val }
  }
}

// total transaksi
const totalTransaksi = computed(() => {
  return cartProducts.value.reduce((sum, p) => {
    return sum + (p.retailPrice * cartStore.cart[p.id])
  }, 0)
})

async function trxWithdrawal() {
  try {
    const payload = {
      storeId: userStore.storeId,
      cashier_session_id: cartStore.cashierSessionId,
      fund_source_id: selectedFund.value?.value,
      amount: Number(nominalWd.value) || 0,
      adminFee: Number(nominalAdmin.value) || 0,
      adminInside: adminInside.value, // true kalau admin di dalam
      note: note.value,
      status: "success",
      transaction_type: "withdrawal"
    }

    // console.log(payload);
    const { data } = await api.post("/transaction/withdrawal", payload)
    console.log("Transaksi tarik tunai berhasil:", data)
    router.push("/")
  } catch (err) {
    console.error("Gagal tarik tunai:", err)
  }
}

async function trxTransfer() {
  try {
    const payload = {
      storeId: userStore.storeId,
      cashier_session_id: cartStore.cashierSessionId,
      fund_source_id: selectedFund.value?.value,
      amount: Number(nominalTf.value) || 0,
      adminFee: Number(nominalAdmin.value) || 0,
      adminBank: Number(nominalAdminBank.value) || 0,
      note: note.value,
      status: "success",
      transaction_type: "transfer"
    }

    // console.log(payload);
    const { data } = await api.post("/transaction/transfer", payload)
    console.log("Transaksi transfer tunai berhasil:", data)
    router.push("/")
  } catch (err) {
    console.error("Gagal transfer tunai:", err)
  }
}

// --- transaksi manual
async function trxManual() {
  try {
    const payload = {
      storeId: userStore.storeId,
      cashier_session_id: cartStore.cashierSessionId,
      fund_source_id: selectedFund.value?.value,
      items: [
        {
          product_id: null, // manual tidak ada product id
          qty: 1,
          cost_price: Number(purchasePrice.value) || 0,
          price: Number(retailPrice.value),
          total: Number(retailPrice.value),
          profit: Number(retailPrice.value) - (Number(purchasePrice.value) || 0)
        }
      ],
      note: note.value,
      status: "success", // manual langsung dianggap lunas
      transaction_type: "manual"
    }
    // console.log(payload)
    const { data } = await api.post("/transaction/manual", payload)
    console.log("Transaksi manual berhasil:", data)
    router.push("/")
  } catch (err) {
    console.error("Gagal transaksi manual:", err)
  }
}

// simpan transaksi
async function simpanTransaksi() {
  try {
    // siapkan payload transaksi
    const payload = {
      storeId: userStore.storeId, // pastikan ada di store
      cashier_session_id: cartStore.cashierSessionId, // pastikan ambil dari session aktif
      fund_source_id: defaultFundId.value, // default laci atau pilihan user
      resourceFund: selectedFund.value?.value,
      items: cartProducts.value.map(p => ({
        product_id: p.id,
        qty: cartStore.cart[p.id],
        cost_price: p.purchasePrice,
        price: p.retailPrice,
        total: p.retailPrice * cartStore.cart[p.id],
        profit: (p.retailPrice - p.purchasePrice) * cartStore.cart[p.id],
      })),
      note: catatan.value,
      status: statusTransaksi.value === "Lunas" ? "success" : "bon",
      transaction_type: "penjualan",
    }

    // console.log(payload);
    const { data } = await api.post("/transaction", payload)

    console.log("Transaksi berhasil disimpan:", data)
    router.push("/")
    // reset cart
    // cartStore.clearCart()
  } catch (err) {
    console.error("Gagal simpan transaksi:", err)
  }
}



onMounted(() => {
  getActiveSession()
  getDefaultFund()
  getExceptDefaultFund()
})
</script>

<template>
  <div class="w-full border-b">
    <nav class="flex justify-around">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        class="relative px-3 py-2 text-sm font-medium text-gray-700"
        :class="activeTab === tab ? 'text-black' : 'text-gray-500'"
      >
        {{ tab }}
        <!-- Underline active -->
        <span
          v-if="activeTab === tab"
          class="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-blue-500 rounded"
        ></span>
      </button>
    </nav>
  </div>

  <!-- Content -->
  <div class="p-4">
    <div v-if="activeTab === 'Transaksi Produk'">
      <div class="flex justify-between">
        <h4>Produk</h4>
        <RouterLink v-if="cartProducts.length === 0" to="/list-product">
          <Button variant="outline">Pilih Produk</Button>
        </RouterLink>
      </div>
      <!-- daftar produk -->
      <div v-for="p in cartProducts" :key="p.id" class="border-b py-3">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium">{{ p.name }}</p>
            <p class="text-blue-600 font-semibold">
              Rp{{ p.retailPrice.toLocaleString("id-ID") }}
            </p>
            <p class="text-sm text-gray-500">Modal : Rp{{ p.purchasePrice.toLocaleString("id-ID") }}</p>
          </div>
          <NumberField
            :model-value="cartStore.cart[p.id]"
            :min="0"
            class="flex items-center"
            @update:model-value="val => updateQty(p.id, val)"
          >
            <NumberFieldContent>
              <NumberFieldDecrement>-</NumberFieldDecrement>
              <NumberFieldInput class="w-24 text-center" />
              <NumberFieldIncrement>+</NumberFieldIncrement>
            </NumberFieldContent>
          </NumberField>
        </div>
      </div>
        <div v-if="cartProducts.length > 0" class="flex justify-center mt-4">
          <RouterLink to="/list-product">
            <Button variant="outline">+ Tambah produk</Button>
          </RouterLink>
        </div>
        <div class="mt-6 space-y-4">
        <div v-if="hasInjectProduct" class="flex flex-col items-start mb-4">
               <Label class="block text-left text-gray-500 mb-2">Sumber Dana Inject</Label>
               <Combobox v-model="selectedFund" by="value">
                 <ComboboxAnchor as-child>
                   <ComboboxTrigger as-child>
                     <Button variant="outline" class="w-[350px] justify-between text-gray-500 font-normal">
                       {{ selectedFund?.label ?? 'Pilih Sumber Dana' }}
                       <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </ComboboxTrigger>
                 </ComboboxAnchor>
     
                 <ComboboxList class="w-[350px]">
                   <div class="relative w-full max-w-sm items-center">
                     <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Sumber Danaa" />
                     <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                       <Search class="size-4 text-muted-foreground" />
                     </span>
                   </div>
                   <ComboboxEmpty>Sumber Dana tidak ditemukan.</ComboboxEmpty>
                   <ComboboxGroup>
                     <ComboboxItem
                       v-for="fund in funds"
                       :key="fund.value"
                       :value="fund"
                     >
                       {{ fund.label }}
                       <ComboboxItemIndicator>
                         <Check class="ml-auto h-4 w-4" />
                       </ComboboxItemIndicator>
                     </ComboboxItem>
                   </ComboboxGroup>
                 </ComboboxList>
               </Combobox>
             </div>
        <div class="grid gap-2 w-full">
        <Label for="note" class="block text-left text-gray-500">Catatan</Label>
        <Input id="note" v-model="catatan" placeholder="" class="w-full text-sm"/>
      </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-500">Status transaksi</label>
          <div class="flex gap-2">
            <Button
              :variant="statusTransaksi === 'Lunas' ? 'default' : 'outline'"
              class="flex-1"
              @click="statusTransaksi = 'Lunas'"
            >
              Lunas
            </Button>
            <Button
              :variant="statusTransaksi === 'Belum Lunas' ? 'default' : 'outline'"
              class="flex-1"
              @click="statusTransaksi = 'Belum Lunas'"
            >
              Belum Lunas
            </Button>
          </div>
        </div>
       </div>
    </div>
    <div v-else-if="activeTab === 'Transaksi Manual'">
      <form @submit.prevent="trxManual" class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 w-full">
    <div class="w-full">
      <!-- Harga -->
      <div class="grid gap-2 w-full mb-4">
        <Label for="retail-price" class="block text-left text-gray-500">Harga Jual</Label>
        <Input id="retail-price" v-model="retailPrice" placeholder="Harga Jual" type="tel" class="w-full text-sm" required />
      </div>
      <div class="grid gap-2 w-full mb-4">
        <Label for="purchase-price" class="block text-left text-gray-500">Harga Modal (Jika Ada)</Label>
        <Input id="purchase-price" v-model="purchasePrice" placeholder="Harga Modal" type="tel" class="w-full text-sm"/>
      </div>
      <div class="border-b border-dashed mt-5 mb-5 w-full"></div>
      <div class="flex flex-col items-start py-4">
               <Label class="block text-left text-gray-500 mb-2">Sumber Dana (Jika Ada)</Label>
               <Combobox v-model="selectedFund" by="value">
                 <ComboboxAnchor as-child>
                   <ComboboxTrigger as-child>
                     <Button variant="outline" class="w-[350px] justify-between text-gray-500 font-normal">
                       {{ selectedFund?.label ?? 'Pilih Sumber Dana' }}
                       <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </ComboboxTrigger>
                 </ComboboxAnchor>
     
                 <ComboboxList class="w-[350px]">
                   <div class="relative w-full max-w-sm items-center">
                     <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Sumber Danaa" />
                     <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                       <Search class="size-4 text-muted-foreground" />
                     </span>
                   </div>
                   <ComboboxEmpty>Sumber Dana tidak ditemukan.</ComboboxEmpty>
                   <ComboboxGroup>
                     <ComboboxItem
                       v-for="fund in funds"
                       :key="fund.value"
                       :value="fund"
                     >
                       {{ fund.label }}
                       <ComboboxItemIndicator>
                         <Check class="ml-auto h-4 w-4" />
                       </ComboboxItemIndicator>
                     </ComboboxItem>
                   </ComboboxGroup>
                 </ComboboxList>
               </Combobox>
             </div>
      <div class="grid w-full gap-1.5">
        <Label for="note" class="text-gray-500">Catatan</Label>
        <Textarea id="note" v-model="note" placeholder="Catatan" class="text-sm" />
        <p class="text-sm text-muted-foreground">Catatan transaksi.</p>
      </div>
    </div>
    <!-- Submit Button -->
    <div class="w-full mt-6">
      <Button type="submit" class="w-full text-white">Simpan Transaksi</Button>
    </div>
  </form>
    </div>
    <div v-else-if="activeTab === 'Transfer'">
      <form @submit.prevent="trxTransfer" class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 w-full">
    <div class="w-full">
      <!-- Harga -->
      <div class="grid gap-2 w-full mb-4">
        <Label for="nominal" class="block text-left text-gray-500">Nominal Transfer</Label>
        <Input id="nominal" v-model="nominalTf" placeholder="Nominal Transfer" type="tel" class="w-full text-sm" required />
      </div>
      <div class="grid gap-2 w-full mb-4">
        <Label for="nominalAdminBank" class="block text-left text-gray-500">Admin Bank (Jika Ada)</Label>
        <Input id="nominalAdminBank" v-model="nominalAdminBank" placeholder="Admin Bank" type="tel" class="w-full text-sm"/>
      </div>
      <div class="grid gap-2 w-full mb-4">
        <Label for="nominalAdmin" class="block text-left text-gray-500">Admin</Label>
        <Input id="nominalAdmin" v-model="nominalAdmin" placeholder="Nominal Admin" type="tel" class="w-full text-sm"/>
      </div>
      <div class="border-b border-dashed mt-5 mb-5 w-full"></div>
      <div class="flex flex-col items-start py-4">
               <Label class="block text-left text-gray-500 mb-2">Sumber Dana Transfer</Label>
               <Combobox v-model="selectedFund" by="value">
                 <ComboboxAnchor as-child>
                   <ComboboxTrigger as-child>
                     <Button variant="outline" class="w-[350px] justify-between text-gray-500 font-normal">
                       {{ selectedFund?.label ?? 'Pilih Sumber Dana' }}
                       <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </ComboboxTrigger>
                 </ComboboxAnchor>
     
                 <ComboboxList class="w-[350px]">
                   <div class="relative w-full max-w-sm items-center">
                     <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Sumber Danaa" />
                     <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                       <Search class="size-4 text-muted-foreground" />
                     </span>
                   </div>
                   <ComboboxEmpty>Sumber Dana tidak ditemukan.</ComboboxEmpty>
                   <ComboboxGroup>
                     <ComboboxItem
                       v-for="fund in funds"
                       :key="fund.value"
                       :value="fund"
                     >
                       {{ fund.label }}
                       <ComboboxItemIndicator>
                         <Check class="ml-auto h-4 w-4" />
                       </ComboboxItemIndicator>
                     </ComboboxItem>
                   </ComboboxGroup>
                 </ComboboxList>
               </Combobox>
             </div>
      <div class="grid w-full gap-1.5">
        <Label for="note" class="text-gray-500">Catatan</Label>
        <Textarea id="note" v-model="note" placeholder="Catatan" class="text-sm" />
        <p class="text-sm text-muted-foreground">Catatan transaksi.</p>
      </div>
    </div>
    <!-- Submit Button -->
    <div class="w-full mt-6">
      <Button type="submit" class="w-full text-white">Simpan Transaksi</Button>
    </div>
  </form>
    </div>
    <div v-else>
      <form @submit.prevent="trxWithdrawal" class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 w-full">
    <div class="w-full">
      <!-- Harga -->
      <div class="grid gap-2 w-full mb-4">
        <Label for="nominal" class="block text-left text-gray-500">Nominal Penarikan</Label>
        <Input id="nominal" v-model="nominalWd" placeholder="Nominal Tarik Tunai" type="tel" class="w-full text-sm" required />
      </div>
      <div class="grid gap-2 w-full mb-4">
        <Label for="nominalAdmin" class="block text-left text-gray-500">Admin</Label>
        <Input id="nominalAdmin" v-model="nominalAdmin" placeholder="Nominal Admin" type="tel" class="w-full text-sm"/>
      </div>
      <div class="flex items-center space-x-2">
        <Switch id="airplane-mode" v-model="adminInside" />
        <Label for="airplane-mode" class="text-gray-500">Admin Di Dalam</Label>
      </div>
      <p class="text-sm text-muted-foreground mt-1">Default admin cash atau admin di potong</p>
      <div class="border-b border-dashed mt-5 mb-5 w-full"></div>
      <div class="flex flex-col items-start py-4">
               <Label class="block text-left text-gray-500 mb-2">Tujuan Dana Penarikan</Label>
               <Combobox v-model="selectedFund" by="value">
                 <ComboboxAnchor as-child>
                   <ComboboxTrigger as-child>
                     <Button variant="outline" class="w-[350px] justify-between text-gray-500 font-normal">
                       {{ selectedFund?.label ?? 'Pilih Sumber Dana' }}
                       <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </ComboboxTrigger>
                 </ComboboxAnchor>
     
                 <ComboboxList class="w-[350px]">
                   <div class="relative w-full max-w-sm items-center">
                     <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Sumber Danaa" />
                     <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                       <Search class="size-4 text-muted-foreground" />
                     </span>
                   </div>
                   <ComboboxEmpty>Sumber Dana tidak ditemukan.</ComboboxEmpty>
                   <ComboboxGroup>
                     <ComboboxItem
                       v-for="fund in funds"
                       :key="fund.value"
                       :value="fund"
                     >
                       {{ fund.label }}
                       <ComboboxItemIndicator>
                         <Check class="ml-auto h-4 w-4" />
                       </ComboboxItemIndicator>
                     </ComboboxItem>
                   </ComboboxGroup>
                 </ComboboxList>
               </Combobox>
             </div>
      <div class="grid w-full gap-1.5">
        <Label for="note" class="text-gray-500">Catatan</Label>
        <Textarea id="note" v-model="note" placeholder="Catatan" class="text-sm" />
        <p class="text-sm text-muted-foreground">Catatan transaksi.</p>
      </div>
    </div>
    <!-- Submit Button -->
    <div class="w-full mt-6">
      <Button type="submit" class="w-full text-white">Simpan Transaksi</Button>
    </div>
  </form>
    </div>
  </div>
  <div
    v-if="cartProducts.length > 0"
    class="fixed bottom-0 left-0 right-0 border-t bg-white p-4 flex justify-between items-center"
  >
    <div class="flex flex-col">
      <span class="text-sm text-gray-600">Total transaksi</span>
      <span class="font-semibold text-gray-900">
        Rp{{ totalTransaksi.toLocaleString("id-ID") }}
      </span>
    </div>
    <Button class="bg-pink-600 hover:bg-pink-700 text-white" @click="simpanTransaksi">
      Simpan Transaksi
    </Button>
  </div>
</template>
