<script setup>
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date"
import { CalendarIcon } from "lucide-vue-next"
import { ref, watch } from "vue"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RangeCalendar } from "@/components/ui/range-calendar"
import { Card, CardContent } from "@/components/ui/card"
import BottomNav from './reusable/BottomNav.vue'
import { useUserStore } from '@/stores'
import api from "../axios"

const userStore = useUserStore()

// --- Helper convert CalendarDate → JS Date
function toJSDate(calendarDate) {
  if (!calendarDate) return null
  return calendarDate.toDate(getLocalTimeZone())
}

// Formatter tanggal
const df = new DateFormatter("en-US", { dateStyle: "medium" })

// Date range default
const dateRange = ref({
  start: new CalendarDate(2025, 9, 20),
  end: new CalendarDate(2025, 9, 29),
})

// Report state
const report = ref({
  totalProfit: 0,
  data: [],
})

// API call ke backend
async function fetchReport() {
  const start = toJSDate(dateRange.value.start)
  const end = toJSDate(dateRange.value.end)
  if (!start || !end) return

  try {
    const res = await api.get("/report", {
      params: {
        storeId: userStore.storeId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    })

    report.value = {
      totalProfit: res.data.totalProfit || 0,
      data: res.data.data || [],
    }
  } catch (err) {
    console.error("Error fetch report:", err)
  }
}

// Initial load
fetchReport()

// Watcher ketika range berubah
watch(dateRange, fetchReport)
</script>

<template>
  <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
    <Card
      class="relative overflow-hidden w-full max-w-md rounded-2xl bg-gradient-to-b from-white to-gray-50 shadow-lg border border-gray-200"
    >
      <!-- Header -->
      <div class="flex justify-between items-start p-5 pb-0">
        <!-- Date Range Picker -->
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              class="rounded-xl text-sm font-medium px-3 py-2 border-gray-200 shadow-sm bg-white hover:bg-gray-50 w-[260px] justify-start text-left"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              <template v-if="dateRange.start">
                <template v-if="dateRange.end">
                  {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }} -
                  {{ df.format(dateRange.end.toDate(getLocalTimeZone())) }}
                </template>
                <template v-else>
                  {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }}
                </template>
              </template>
              <template v-else>Pick a date</template>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <RangeCalendar
              v-model="dateRange"
              initial-focus
              :number-of-months="2"
              @update:start-value="(startDate) => (dateRange.start = startDate)"
            />
          </PopoverContent>
        </Popover>
      </div>

      <!-- Profit Section -->
      <CardContent class="px-5 py-4 space-y-4">
        <div>
          <p class="text-gray-500 text-sm font-medium">Laporan</p>
          <h2 class="text-2xl font-semibold mt-1 mb-2">Keuntungan</h2>
        </div>
        <p class="text-4xl font-bold text-gray-900 mb-4">
          Rp{{ report.totalProfit.toLocaleString() }}.00
        </p>
        <div class="mt-5">
          <p class="text-gray-400 text-xs">
            Data diambil berdasarkan tanggal: 
            <strong>{{ df.format(dateRange.start.toDate(getLocalTimeZone())) }}</strong>
            -
            <strong>{{ df.format(dateRange.end.toDate(getLocalTimeZone())) }}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
  <BottomNav />
</template>
