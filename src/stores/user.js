// stores/user.js
import { defineStore } from "pinia"
import api from "@/axios"

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),
  actions: {
    setUser(user) {
      this.user = user
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
      } catch (err) {
        console.error("Gagal fetch user:", err)
        this.user = null
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem("token")
    }
  }
})
