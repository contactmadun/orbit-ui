import { defineStore } from 'pinia'

export const useRegisterStore = defineStore('register', {
  state: () => ({
    form: {
      name: '',
      outlet: '',
      number: '',
      email: '',
      password: ''
    },
    plan: null
  }),
})
