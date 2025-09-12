<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { ChevronDown } from "lucide-vue-next"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const bestProduct = ref("Home Living")
const totalSales = ref(4.956) // dalam K (ribuan)
const percentage = ref(25)

const selectedPeriod = ref("monthly")

// data kategori produk
const categories = ref([
  { name: "Electronics", value: 15 },
  { name: "Automotive", value: 20 },
  { name: "Home Living", value: 90 }, // highlight
  { name: "Sports", value: 10 },
  { name: "Groceries", value: 8 },
  { name: "More", value: 5 },
])

</script>

<template>
  <div class="flex flex-col gap-3 items-start mb-10 pt-10 px-5">
    <!-- Header -->
    <div class="w-full flex justify-between items-center mb-4">
      <h2 class="text-base font-semibold text-gray-800">
        Top product based on sales
      </h2>
      <!-- shadcn Select -->
      <Select v-model="selectedPeriod">
        <SelectTrigger class="w-[120px] h-8 text-sm">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Total Sales -->
    <div>
      <p class="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
        ${{ totalSales }}K
        <span class="text-green-500 text-sm font-medium">+{{ percentage }}%</span>
      </p>
      <p class="text-sm text-gray-500">
        Great job! You've boosted your estimate by an impressive $2,150 compared
        to last month!
      </p>
    </div>

    <!-- Chart kategori -->
    <div class="mt-6 flex items-end gap-4 h-40 w-full">
      <div
        v-for="cat in categories"
        :key="cat.name"
        class="flex flex-col items-center justify-end flex-1"
      >
        <!-- Bar -->
        <div
          class="w-10 rounded-md transition-all duration-300"
          :class="[
            cat.name === bestProduct
              ? 'bg-blue-500'
              : 'bg-gray-200'
          ]"
          :style="{ height: cat.value + 'px' }"
        ></div>

        <!-- Label -->
        <span
          class="text-xs mt-2 text-center"
          :class="cat.name === bestProduct ? 'text-blue-600 font-medium' : 'text-gray-600'"
        >
          {{ cat.name }}
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-b mt-8 w-full"></div>
  </div>
</template>
