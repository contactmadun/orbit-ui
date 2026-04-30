<script setup>
import { ref, watch } from 'vue'
import Textarea from '../ui/textarea/Textarea.vue'
import Checkbox from '../ui/checkbox/Checkbox.vue'
import Switch from '../ui/switch/Switch.vue'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../ui/select'

const emit = defineEmits(['submit', 'cancel'])

const newFeature = ref('')

const loading = ref(false)

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const form = ref({
  name: '',
  price: 0,
  tag: '',
  desc: '',
  durationDays: 1,
  levels: 0,
  maxOutlets: 1,
  maxUsers: 1,
  billType: 'daily',
  isHighlight: false,
  isTrial: false,
  features: [],
  featuresJson: {
    multiOutlet: false,
    imei: false,
    export: false,
    bill: false,
    maxTransactionPerDay: null
  }
})

function addFeature() {
  if (!newFeature.value) return
  form.value.features.push(newFeature.value)
  newFeature.value = ''
}

function submit() {
  emit('submit', {
    name: form.value.name,
    descriptions: form.value.desc,
    price: form.value.price,
    durationDays: form.value.durationDays,
    levels: form.value.levels,
    billingType: form.value.billType,
    maxOutlets: form.value.maxOutlets,
    maxUsers: form.value.maxUsers,
    tag: form.value.tag,
    isHighlight: form.value.isHighlight,
    isTrial: form.value.isTrial,
    features: form.value.features,
    featuresJson: form.value.featuresJson
  })
}

watch(
  () => props.initialData,
  (plan) => {
    if (!plan) return

    form.value = {
      name: plan.name,
      price: plan.price,
      tag: plan.tag,
      desc: plan.descriptions,
      durationDays: plan.durationDays,
      levels: plan.levels,
      maxOutlets: plan.maxOutlets,
      maxUsers: plan.maxUsers,
      billType: plan.billingType ?? 'daily',
      isHighlight: plan.isHighlight,
      isTrial: plan.isTrial,
      features: Array.isArray(plan.features)
        ? [...plan.features]
        : JSON.parse(plan.features || '[]'),
      featuresJson:
        typeof plan.featuresJson === 'string'
          ? JSON.parse(plan.featuresJson)
          : plan.featuresJson
    }
  },
  { immediate: true }
)



</script>



<template>
  <div class="space-y-6">
    <h1 class="font-semibold">General Information</h1>
    <div>
      <label class="text-slate-500 block text-sm mb-2">Plan name</label>
      <input v-model="form.name" class="px-4 py-2 border rounded-lg text-sm w-full" />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-slate-500 block text-sm mb-2">Price</label>
        <input type="number" v-model="form.price" class="px-4 py-2 border rounded-lg text-sm w-full" />
      </div>
      <div>
        <label class="text-slate-500 block text-sm mb-2">Tag</label>
        <input v-model="form.tag" class="px-4 py-2 border rounded-lg text-sm w-full" />
      </div>
    </div>

    <div>
      <label class="text-slate-500 block text-sm mb-2">Description</label>
      <Textarea row="3" v-model="form.desc" class="px-4 py-2 border rounded-lg text-sm w-full" />
    </div>

    <div class="flex border-t border-dashed"></div>

    <h1 class="font-semibold">Plan Detail</h1>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-slate-500 block text-sm mb-2">Max Outlet</label>
        <input type="number" v-model="form.maxOutlets" class="px-4 py-2 border rounded-lg text-sm w-full" />
      </div>
      <div>
        <label class="text-slate-500 block text-sm mb-2">Max User</label>
        <input type="number" v-model="form.maxUsers" class="px-4 py-2 border rounded-lg text-sm w-full" />
      </div>    
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="text-slate-500 block text-sm mb-2">
            Billing Type
        </label>

        <Select v-model="form.billType">
            <SelectTrigger class="w-full">
            <SelectValue placeholder="Pilih billing type" />
            </SelectTrigger>

            <SelectContent>
            <SelectItem value="daily">
                Daily (per hari)
            </SelectItem>
            <SelectItem value="monthly">
                Monthly (per bulan)
            </SelectItem>
            </SelectContent>
        </Select>
       </div>
      <div>
        <label class="text-slate-500 block text-sm mb-2">Duration Day</label>
        <input type="number" v-model="form.durationDays" class="px-4 py-2 border rounded-lg text-sm w-full" />
      </div>    
      <div>
        <label class="text-slate-500 block text-sm mb-2">Level</label>
        <input type="number" v-model="form.levels" class="px-4 py-2 border rounded-lg text-sm w-full" />
      </div>    
    </div>

    <div class="flex border-t border-dashed"></div>

    <h1 class="font-semibold">Description Features</h1>

<div class="space-y-3">
  <div class="flex gap-2">
    <input
      v-model="newFeature"
      placeholder="Contoh: Riwayat transaksi"
      class="flex-1 px-4 py-2 border rounded-lg text-sm"
    />
    <button
      @click="addFeature"
      class="px-3 rounded-lg bg-blue-800 text-white"
    >
      +
    </button>
  </div>

  <ul class="space-y-2">
    <li
      v-for="(feature, i) in form.features"
      :key="i"
      class="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg"
    >
      <span class="text-sm">{{ feature }}</span>
      <button
        @click="form.features.splice(i, 1)"
        class="text-red-500 text-xs"
      >
        Hapus
      </button>
    </li>
  </ul>
</div>

<div class="flex border-t border-dashed"></div>

<h1 class="font-semibold">Advanced Features</h1>

    <div class="space-y-4">
    <label class="flex items-center gap-3">
        <Checkbox v-model="form.featuresJson.multiOutlet" />
        <span class="text-sm">Multi Outlet</span>
    </label>
    <label class="flex items-center gap-3">
        <Checkbox v-model="form.featuresJson.imei" />
        <span class="text-sm">POS Electronics</span>
    </label>
    <label class="flex items-center gap-3">
        <Checkbox v-model="form.featuresJson.export" />
        <span class="text-sm">Export Data</span>
    </label>
    <label class="flex items-center gap-3">
        <Checkbox v-model="form.featuresJson.bill" />
        <span class="text-sm">Struk</span>
    </label>
    </div>  

    <div class="flex items-center gap-2">
      <Switch v-model="form.isHighlight" />
      <span class="text-sm">Highlight</span>
    </div>

    <div class="flex items-center gap-2">
      <Switch v-model="form.isTrial" />
      <span class="text-sm">Trial Plan</span>
    </div>

    <div v-show="form.isTrial">
    <label class="text-sm block mb-1">
      Max Transaksi per Hari
    </label>
    <input
      type="number"
      v-model="form.featuresJson.maxTransactionPerDay"
      class="px-4 py-2 border rounded-lg text-sm w-full"
    />
  </div>

    <div class="flex justify-end gap-3 pt-4 border-t border-dashed">
      <button
        @click="emit('cancel')"
        class="px-4 py-2 rounded-lg border"
      >
        Batal
      </button>
      <button
        @click="submit"
        class="px-4 py-2 rounded-lg bg-blue-800 text-white"
      >
        Simpan
      </button>
    </div>
  </div>
</template>

