<script setup>
import api from '../axios'
import { Check, ChevronsUpDown, Search } from "lucide-vue-next"
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue'
import TopNavbar from './reusable/TopNavbar.vue'
import Label from './ui/label/Label.vue'
import Input from './ui/input/Input.vue'
import Button from './ui/button/Button.vue'
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

const route = useRoute()

const brands = [
  { label: "Telkomsel", value: "telkomsel" },
  { label: "Tri", value: "tri" },
  { label: "Robot", value: "robot" },
]

const categorys = [
  { label: "Voucher", value: "voucher" },
  { label: "Kartu", value: "Kartu" },
  { label: "Aksesoris", value: "Aksesoris" },
]

const selectedBrand = ref(null)
const selectedCategory  = ref(null)

</script>

<template>
    <TopNavbar title="Tambah Produk"/>
    <div class="flex flex-col gap-3 items-start lg:justify-center mb-10 pt-5 px-5">
    <div class="w-full">
        <h1 class="font-medium mb-7">Produk Info</h1>
        <div class="grid gap-2 w-full">
            <Label for="name" class="block text-left text-gray-500">Nama Produk</Label>
            <Input id="text" v-model="name" placeholder="Voucher Data Tsel" class="w-full text-sm" required></Input>
        </div>
        <div class="grid grid-cols-2 text-left">
            <!-- Kolom Penjualan -->
            <div class="flex flex-col items-start py-4">
                <Label for="name" class="block text-left text-gray-500 mb-2">Brand</Label>
                <Combobox v-model="value" by="label">
                <ComboboxAnchor as-child>
                <ComboboxTrigger as-child>
                    <Button variant="outline" class="w-[150px] justify-between text-gray-500 font-normal">
                    {{ value?.label ?? 'Pilih Brand' }}

                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList class="w-[150px]">
                <div class="relative w-full max-w-sm items-center">
                    <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Brand" />
                    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                    <Search class="size-4 text-muted-foreground" />
                    </span>
                </div>

                <ComboboxEmpty>
                    No framework found.
                </ComboboxEmpty>

                <ComboboxGroup>
                    <ComboboxItem
                    v-for="brand in brands"
                    :key="brand.value"
                    :value="brand"
                    >
                    {{ brand.label }}

                    <ComboboxItemIndicator>
                        <Check :class="cn('ml-auto h-4 w-4')" />
                    </ComboboxItemIndicator>
                    </ComboboxItem>
                </ComboboxGroup>
                </ComboboxList>
            </Combobox>
            </div>
            <!-- Kolom Pengeluaran -->
            <div class="flex flex-col items-start py-4">
               <Label for="name" class="block text-left text-gray-500 mb-2">Kategori</Label>
                <Combobox v-model="value" by="label">
                <ComboboxAnchor as-child>
                <ComboboxTrigger as-child>
                    <Button variant="outline" class="w-[150px] justify-between text-gray-500 font-normal">
                    {{ value?.label ?? 'Pilih Kategori' }}

                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList class="w-[150px]">
                <div class="relative w-full max-w-sm items-center">
                    <ComboboxInput class="pl-1 focus-visible:ring-0 border-0 border-b rounded-none h-10" placeholder="Cari Kategori" />
                    <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                    <Search class="size-4 text-muted-foreground" />
                    </span>
                </div>

                <ComboboxEmpty>
                    No framework found.
                </ComboboxEmpty>

                <ComboboxGroup>
                    <ComboboxItem
                    v-for="category in categorys"
                    :key="category.value"
                    :value="category"
                    >
                    {{ category.label }}

                    <ComboboxItemIndicator>
                        <Check :class="cn('ml-auto h-4 w-4')" />
                    </ComboboxItemIndicator>
                    </ComboboxItem>
                </ComboboxGroup>
                </ComboboxList>
            </Combobox>
            </div>
        </div>
        <div class="grid w-full gap-1.5">
            <Label for="description" class="text-gray-500">Deskripsi Produk</Label>
            <Textarea id="description" placeholder="Deskripsi produk" class="text-sm" />
            <p class="text-sm text-muted-foreground">
            Lengkapi deskripsi produkmu.
            </p>
        </div>
        <div class="border-b border-dashed mt-5 w-full"></div>
        <h1 class="font-medium mb-7 mt-5">Stok Info</h1>
    </div>
    </div>
</template>