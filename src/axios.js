import axios from 'axios'

const api= axios.create({
    // baseURL: 'http://localhost:3000/'
    baseURL: 'https://api2.personal-assistant.biz.id/'
})

export default api
// axios.defaults.baseURL = 'http://localhost:3000/';