import { defineStore } from "pinia"
import api from "@/axios"

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null, 
    token: localStorage.getItem("token") || null,
    tenantId: null,
    outletId: null,
    role: null,
  }),

  getters: {
    isSuperAdmin: (state) => state.role === "super_admin",
    isAdmin: (state) => state.role === "admin",
    isCashier: (state) => state.role === "cashier",
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    setUser(user) {
      this.user = user
      this.tenantId = user?.tenantId || null
      this.outletId = user?.outletId || null
      this.role = user?.role || null
    },

    setToken(token) {
      this.token = token
      localStorage.setItem("token", token)
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${this.token}` }
        })

        this.setUser(res.data)

      } catch (err) {
        console.error("Gagal fetch user:", err)
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.tenantId = null
      this.outletId = null
      this.role = null
      localStorage.removeItem("token")
    }
  },

  persist: true,
})