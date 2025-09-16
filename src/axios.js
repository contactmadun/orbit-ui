import axios from 'axios'

const api= axios.create({
    baseURL: 'http://localhost:3000/'
    // baseURL: 'https://api2.personal-assistant.biz.id/'
})

// Interceptor: semua request otomatis pakai token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

//percobaan

export default api
// axios.defaults.baseURL = 'http://localhost:3000/';