<script setup>
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone
} from "@internationalized/date"
import { CalendarIcon } from "lucide-vue-next"
import { ref, watch } from "vue"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronRight } from 'lucide-vue-next'
import { RangeCalendar } from "@/components/ui/range-calendar"
import { Card, CardContent } from "@/components/ui/card"
import BottomNav from "./reusable/BottomNav.vue"
import { useUserStore } from "@/stores"
import api from "../axios"
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const value = ref(0)
const jumlahBelumLunas = ref(0)
const loadingSkelton = ref(true)

// ✅ FIX: Konversi CalendarDate ke JS Date tanpa geser ke UTC
function toLocalJSDate(calendarDate) {
  if (!calendarDate) return null
  // CalendarDate pakai tahun-bulan-hari lokal, buat Date lokal manual
  const { year, month, day } = calendarDate
  return new Date(year, month - 1, day, 0, 0, 0)
}

// Formatter tanggal (gunakan locale Indonesia)
const df = new DateFormatter("id-ID", { dateStyle: "medium" })

// ✅ Default date range = hari ini
const today = new Date()
const todayCalendar = new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
const dateRange = ref({
  start: todayCalendar,
  end: todayCalendar
})

const report = ref({
  totalProfit: 0,
  data: []
})

async function fetchReport() {
  const start = toLocalJSDate(dateRange.value.start)
  const end = toLocalJSDate(dateRange.value.end)
  if (!start || !end) return

  // ✅ Jadikan start jam 00:00:00 dan end jam 23:59:59 lokal
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  console.log("Start:", start.toISOString())
  console.log("End:", end.toISOString())

  try {
    const res = await api.get("/report", {
      params: {
        storeId: userStore.storeId,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    })

    report.value = {
      totalProfit: res.data.totalProfit || 0,
      data: res.data.data || []
    }
  } catch (err) {
    console.error("Error fetch report:", err)
  }
}

async function fetchDataBon() {
  loadingSkelton.value = true
  try {
    const res = await api.get("/transaction/bon", {
      params: { storeId: userStore.storeId }
    })

    value.value = res.data.totalPiutang || 0
    jumlahBelumLunas.value = res.data.jumlahTransaksi || 0
  } catch (err) {
    console.error("Error getDataBon:", err)
  } finally {
    loadingSkelton.value = false
  }
}

const handleRoute = async () => {
  try {
    router.push("/list-bon")
  } catch (error) {
    console.log(error);
  }
}
fetchDataBon()
fetchReport()
watch(dateRange, fetchReport)
</script>

<template>
  <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
    <Card
      class="relative overflow-hidden w-full max-w-md rounded-2xl bg-gradient-to-b from-white to-gray-50 shadow-lg border border-gray-200"
    >
      <div class="flex justify-between items-start p-5 pb-0">
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              class="rounded-xl text-sm font-medium px-3 py-2 border-gray-200 shadow-sm bg-white hover:bg-gray-50 w-[260px] justify-start text-left"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              <template v-if="dateRange.start">
                <template v-if="dateRange.end">
                  {{ df.format(toLocalJSDate(dateRange.start)) }} -
                  {{ df.format(toLocalJSDate(dateRange.end)) }}
                </template>
                <template v-else>
                  {{ df.format(toLocalJSDate(dateRange.start)) }}
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
            <strong>{{ df.format(toLocalJSDate(dateRange.start)) }}</strong> -
            <strong>{{ df.format(toLocalJSDate(dateRange.end)) }}</strong>
          </p>
        </div>
      </CardContent>
    </Card>
    <Card class="w-full shadow-md mt-5 rounded-2xl">
          <CardContent class="px-5 flex flex-col gap-4">
            
            <!-- Header -->
            <div class="flex justify-between items-center">
              <h2 class="text-md font-medium text-gray-800">Jumlah Piutang</h2>
                <ChevronRight @click="handleRoute" class="w-4 h-4 text-gray-500" />
            </div>

            <div class="flex">
              <!-- Value -->
              <div>
                <div class="flex items-start">
                  <span class="text-3xl font-bold">Rp{{ value ? value.toLocaleString() : '' }}</span>
                  <span v-if="loadingSkelton" class="ml-1 h-8 w-32 bg-gray-200 rounded animate-pulse"></span>
                </div>
                <div class="mt-5">
                  <p class="text-gray-400 text-xs">
                    Jumlah Transaksi Belum Lunas : <span>{{ jumlahBelumLunas }}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
  </div>
  <BottomNav />
</template>
