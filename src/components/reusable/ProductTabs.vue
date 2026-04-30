<script setup>
import { useRouter, useRoute } from "vue-router";
import {
  LayoutDashboard,
  PlusCircle,
  Boxes,
  Tags,
  BadgePercent,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const menus = [
  {
    name: "Overview Produk",
    path: "/product",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Produk",
    path: "/product/list-product",
    icon: PlusCircle,
  },
  {
    name: "Stok Produk",
    path: "/product/stock",
    icon: Boxes,
  },
  {
    name: "Kategori",
    path: "/product/add-category",
    icon: Tags,
  },
  {
    name: "Brand",
    path: "/product/add-brand",
    icon: BadgePercent,
  },
];

const isActive = (menu) => {
  if (menu.exact) {
    return route.path === menu.path;
  }
  return route.path.startsWith(menu.path);
};

const goTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="inline-flex bg-gray-100 p-1 rounded-full">
    <button
      v-for="menu in menus"
      :key="menu.name"
      @click="goTo(menu.path)"
      class="flex items-center gap-2 px-4 py-1.5 text-sm rounded-full transition-all duration-200"
      :class="
        isActive(menu)
          ? 'bg-white shadow text-slate-900'
          : 'text-slate-600 hover:text-slate-900'
      "
    >
      <component v-if="isActive(menu)" :is="menu.icon" class="w-4 h-4" />
      {{ menu.name }}
    </button>
  </div>
</template>
