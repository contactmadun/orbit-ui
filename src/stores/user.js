// stores/user.js
import { defineStore } from "pinia"
import api from "@/axios"

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null, // berisi { id, email, name, storeId, ... }
    token: localStorage.getItem("token") || null,
    storeId: null, // tambahkan khusus storeId
  }),
  actions: {
    setUser(user) {
      this.user = user
      this.storeId = user?.storeId || null // simpan storeId saat setUser
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
        this.user = res.data
        this.storeId = res.data?.storeId || null
      } catch (err) {
        console.error("Gagal fetch user:", err)
        this.user = null
        this.storeId = null
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.storeId = null
      localStorage.removeItem("token")
    }
  },
  persist: true, // simpan state agar tidak hilang setelah refresh
})

