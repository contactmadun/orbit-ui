<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { Upload, ArrowLeft, Image as ImageIcon, Printer } from "lucide-vue-next"
import api from '../axios'

const router = useRouter()
const image = ref(null)
const preview = ref(null)
const isUploading = ref(false)
const parsed = ref(null)
const isPrinting = ref(false)
const bluetoothDevice = ref(null)
const printerServer = ref(null)

// --- Upload & OCR ---
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  image.value = file
  preview.value = URL.createObjectURL(file)
}

const handleUpload = async () => {
  if (!image.value) return alert("Pilih gambar terlebih dahulu!");
  isUploading.value = true;
  const formData = new FormData();
  formData.append("image", image.value);
  try {
    const res = await api.post("/ocr", formData);
    // Normalisasi hasil parsed
    parsed.value = {
      tanggal: res.data?.parsed?.tanggal || "",
      bank_tujuan: res.data?.parsed?.bank || "",
      rekening_penerima: res.data?.parsed?.rekening_penerima || "",
      penerima: res.data?.parsed?.penerima || "",
      pengirim: res.data?.parsed?.pengirim || "",
      reff: res.data?.parsed?.noref || "",
      nominal: res.data?.parsed?.nominal || 0,
      biaya_admin: res.data?.biaya_admin || 5000,
    };
  } catch (err) {
    console.error(err);
    alert("Gagal upload gambar!");
  } finally {
    isUploading.value = false;
  }
};

// --- Bluetooth Printing ---
const connectBluetooth = async () => {
  try {
    bluetoothDevice.value = await navigator.bluetooth.requestDevice({
      filters: [{ services: [0x18f0] }, { services: [0xff00] }],
      optionalServices: [0x18f0, 0xff00],
    })
    const server = await bluetoothDevice.value.gatt.connect()
    printerServer.value = server
    alert("✅ Printer berhasil terhubung!")
  } catch (error) {
    console.error(error)
    alert("❌ Gagal menghubungkan printer Bluetooth! Pastikan printer dalam mode BLE dan dekat dengan perangkat.")
  }
}

const printToBluetooth = async () => {
  if (!parsed.value) return alert("Tidak ada data untuk dicetak")
  if (!printerServer.value) return connectBluetooth()
  isPrinting.value = true

  try {
    let service, characteristic

    // deteksi otomatis service printer
    try {
      service = await printerServer.value.getPrimaryService(0x18f0)
      characteristic = await service.getCharacteristic(0x2af1)
    } catch {
      // fallback ke FF00 (beberapa printer lawas)
      service = await printerServer.value.getPrimaryService(0xff00)
      characteristic = await service.getCharacteristic(0xff01)
    }

const text = `
MINI ATM BERSAMA
IAM CELL
Jl.NASIONAL 05 TANJUNGSARI
${parsed.value.tanggal || "10/9/2025 10:24"}

BANK TUJUAN  : ${parsed.value.bank_tujuan || "BRI"}
NO. REKENING : ${parsed.value.rekening_penerima || "-"}
NAMA PENERIMA: ${parsed.value.penerima || "-"}
PENGIRIM     : ${parsed.value.pengirim || "-"}
NO. REFF     : ${parsed.value.reff || "-"}
NOMINAL      : Rp${(parsed.value.nominal || 0).toLocaleString("id-ID")}
BIAYA ADMIN  : Rp${(parsed.value.biaya_admin || 5000).toLocaleString("id-ID")}
TOTAL        : Rp${((parsed.value.nominal || 0) + (parsed.value.biaya_admin || 5000)).toLocaleString("id-ID")}

TERSEDIA PULSA ALL OPERATOR
BAYAR LISTRIK, PDAM, TOP UP E-WALLET
TERIMAKASIH\n\n\n\n\n\x1B\x64\x05
`

    // konversi ke byte
    const encoder = new TextEncoder()
    const data = encoder.encode("\x1B\x40" + text + "\n\n\n\x1D\x56\x41")

    await characteristic.writeValue(data)
    alert("✅ Struk berhasil dikirim ke printer!")
  } catch (err) {
    console.error("Error print:", err)
    alert("❌ Gagal mencetak struk ke printer! Periksa koneksi Bluetooth atau UUID printer.")
  } finally {
    isPrinting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center bg-gray-50 p-5">
    <!-- Header -->
    <div class="w-full max-w-md flex items-center justify-between mb-6 no-print">
      <button @click="router.back()" class="flex items-center text-gray-700">
        <ArrowLeft class="w-5 h-5 mr-1" /> Kembali
      </button>
    </div>

    <!-- Upload Card -->
    <div class="w-full max-w-md bg-white p-6 rounded-2xl shadow text-center no-print">
      <div class="mb-4 flex flex-col items-center">
        <label for="upload" class="cursor-pointer flex flex-col items-center">
          <ImageIcon class="w-12 h-12 text-gray-400 mb-2" />
          <span class="text-gray-600 text-sm">Pilih Screenshot dari Bank</span>
          <input id="upload" type="file" accept="image/*" @change="handleFileChange" class="hidden" />
        </label>
      </div>

      <div v-if="preview" class="mt-4">
        <img :src="preview" alt="preview" class="w-full rounded-lg shadow" />
      </div>

      <button
        @click="handleUpload"
        class="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
        :disabled="isUploading"
      >
        <Upload class="w-4 h-4" />
        {{ isUploading ? 'Mengunggah...' : 'Konversi ke Struk' }}
      </button>
    </div>

    <!-- Struk -->
    <div
      v-if="parsed"
      id="print-area"
      class="w-[320px] bg-white shadow p-5 rounded-lg text-sm font-mono border relative print-only-area"
    >
      <div class="text-center border-b pb-3 mb-3">
        <h2 class="font-bold text-base">MINI ATM BERSAMA</h2>
        <p class="text-xs">Jl.NASIONAL 05 TANJUNGSARI</p>
        <p>{{ parsed.tanggal || '10/9/2025 10:24' }}</p>
      </div>

      <div class="space-y-1">
        <p><b>BANK TUJUAN :</b> {{ parsed.bank_tujuan || 'BRI' }}</p>
        <p><b>NO. REKENING :</b> {{ parsed.rekening_penerima }}</p>
        <p><b>NAMA PENERIMA :</b> {{ parsed.penerima }}</p>
        <p><b>PENGIRIM :</b> {{ parsed.pengirim }}</p>
        <p><b>NO. REFF :</b> {{ parsed.reff }}</p>
        <p><b>NOMINAL :</b> Rp{{ parsed.nominal?.toLocaleString('id-ID') || '0' }}</p>
        <p><b>BIAYA ADMIN :</b> Rp{{ parsed.biaya_admin?.toLocaleString('id-ID') || '0' }}</p>
        <p><b>TOTAL :</b> Rp{{ ((parsed.nominal || 0) + (parsed.biaya_admin || 0)).toLocaleString('id-ID') }}</p>
      </div>

      <div class="border-t mt-3 pt-3 text-center text-xs text-gray-500">
        TERSEDIA PULSA ALL OPERATOR<br />
        BAYAR LISTRIK, PDAM, TOP UP E-WALLET<br />
        <b>TERIMAKASIH</b>
      </div>

      <!-- Tombol Print -->
      <div class="mt-4 text-center no-print flex gap-2 justify-center">
        <button
          @click="printToBluetooth"
          class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          :disabled="isPrinting"
        >
          <Printer class="w-4 h-4" /> {{ isPrinting ? "Mencetak..." : "Print Thermal" }}
        </button>

        <button
          @click="connectBluetooth"
          class="inline-flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          🔗 Hubungkan Printer
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: white;
  }
  .no-print {
    display: none !important;
  }
  #print-area {
    width: 58mm !important;
    margin: 0 auto;
    border: none;
    box-shadow: none;
    padding: 0;
  }
}
</style>
