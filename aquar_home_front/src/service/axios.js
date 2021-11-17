import axios from "axios"
import router from '../router.js'
let config = {
  timeout: 10000,
  withCredentials: true
}
const instance = axios.create(config)

instance.interceptors.request.use(
  config => {
    config.headers.Authorization = 'Bearer '+localStorage.getItem('token')
    return config
  },
  error => {
    console.log(`axios request error: ${error}`)
    Promise.reject(error)
  }
)

instance.interceptors.response.use(
  res => {
    return res
  },
  error => {
    console.log('axios response error:' + error);
    const code = error.response.status || 200
    if (code === 403 || code === 401) {
      localStorage.removeItem('token')
      router.push('/login')
      return Promise.reject(error);
    } else {
      return Promise.reject(error);
    }
  }
)


export default instance