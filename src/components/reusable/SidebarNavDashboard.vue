<script setup>
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const openMenus = ref({});

const menus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    roles: ["super_admin", "system_admin", "cashier"],
  },
  {
    name: "POS",
    path: "/pos",
    roles: ["super_admin", "system_admin", "cashier"],
    children: [
      {
        name: "Overview",
        path: "/pos",
        roles: ["super_admin", "system_admin", "cashier"],
      },
      {
        name: "Produk",
        path: "/product",
        roles: ["super_admin", "system_admin"],
      },
      {
        name: "Akun Bank",
        path: "/account",
        roles: ["super_admin", "system_admin"],
      },
      {
        name: "Riwayat Transaksi",
        path: "/history",
        roles: ["super_admin", "system_admin"],
      },
    ],
  },
  {
    name: "Outlet",
    path: "/outlet",
    roles: ["super_admin", "system_admin"],
  },
  {
    name: "Pengguna",
    path: "/user",
    roles: ["super_admin", "system_admin"],
  },
  {
    name: "Berlangganan",
    path: "/subscription",
    roles: ["super_admin", "system_admin"],
    children: [
      {
        name: "Overview",
        path: "/subscription",
        roles: ["super_admin"],
      },
      {
        name: "Paket Berlangganan",
        path: "/subscription/subscriber",
        roles: ["super_admin", "system_admin"],
      },
      {
        name: "List Subscriber",
        path: "/subscription/subscriber",
        roles: ["super_admin"],
      },
      {
        name: "Pembayaran",
        path: "/subscription/billing",
        roles: ["super_admin", "system_admin"],
      },
    ],
  },
  {
    name: "Mutasi Bank",
    path: "/mutation",
    roles: ["system_admin"],
  },
  {
    name: "Keuangan",
    path: "/finance",
    roles: ["system_admin"],
  },
  {
    name: "Member Pelanggan",
    path: "/member",
    roles: ["super_admin", "system_admin"],
  },
  {
    name: "Integrasi",
    path: "/integration",
    roles: ["super_admin", "system_admin"],
  },
  {
    name: "Pengaturan",
    path: "/setting",
    roles: ["super_admin", "system_admin"],
  },
];
const isActive = (path) => {
  // Khusus overview
  if (path === "/subscription") {
    return route.path === "/subscription";
  }

  return route.path.startsWith(path);
};

const isChildActive = (children) => {
  return children?.some((child) => route.path.startsWith(child.path));
};

// Inisialisasi openMenus berdasarkan route aktif
const initOpenMenus = () => {
  menus.forEach((menu) => {
    if (menu.children) {
      openMenus.value[menu.path] = isChildActive(menu.children);
    }
  });
};

// Jalankan saat pertama kali load
initOpenMenus();

// Watch route changes untuk auto-expand parent menu
watch(
  () => route.path,
  () => {
    menus.forEach((menu) => {
      if (menu.children && isChildActive(menu.children)) {
        openMenus.value[menu.path] = true;
      }
    });
  },
);

const toggleMenu = (menu) => {
  if (!menu.children) {
    router.push(menu.path);
    return;
  }

  // Toggle manual - bisa collapse walaupun child aktif
  openMenus.value[menu.path] = !openMenus.value[menu.path];
};

const filteredMenus = computed(() => {
  return menus
    .filter((menu) => menu.roles?.includes(userStore.role))
    .map((menu) => {
      if (!menu.children) return menu;

      const filteredChildren = menu.children.filter((child) =>
        child.roles?.includes(userStore.role),
      );

      return {
        ...menu,
        children: filteredChildren,
      };
    });
});
</script>

<template>
  <aside
    class="w-64 bg-white border-r flex flex-col fixed left-0 top-0 h-screen"
  >
    <!-- LOGO -->
    <div
      class="h-16 flex items-center px-6 font-bold text-blue-900 text-xl shrink-0 border-b"
    >
      Orbit POS
    </div>

    <!-- MENU -->
    <nav class="flex-1 px-4 py-2 overflow-y-auto">
      <div class="space-y-1">
        <div v-for="menu in filteredMenus" :key="menu.path">
          <!-- PARENT MENU -->
          <button
            @click="toggleMenu(menu)"
            class="w-full flex items-center justify-between px-4 py-2 rounded-lg transition"
            :class="
              isActive(menu.path)
                ? 'bg-blue-50 text-blue-900 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            "
          >
            <span>{{ menu.name }}</span>

            <!-- Arrow -->
            <svg
              v-if="menu.children"
              class="w-4 h-4 transition-transform"
              :class="openMenus[menu.path] ? 'rotate-90' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- CHILD MENU with vertical line -->
          <div
            v-if="menu.children && openMenus[menu.path]"
            class="relative ml-6 mt-1 space-y-1"
          >
            <!-- Vertical Line -->
            <div class="absolute left-2 top-0 bottom-0 w-px bg-gray-300"></div>

            <button
              v-for="(child, index) in menu.children"
              :key="child.path"
              @click="router.push(child.path)"
              class="relative w-full text-left px-4 py-2 rounded-md text-sm transition"
              :class="
                isActive(child.path)
                  ? 'bg-blue-100 text-blue-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              "
            >
              <!-- Horizontal connector -->
              <div
                class="absolute left-2 top-1/2 w-3 h-px bg-gray-300 -translate-y-1/2"
              ></div>

              <span class="pl-5">{{ child.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- FOOTER -->
    <div class="p-4 border-t shrink-0">
      <button class="w-full py-2 text-sm rounded-lg border text-red-500">
        Keluar Aplikasi
      </button>
    </div>
  </aside>
</template>
