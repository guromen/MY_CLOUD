import axios from 'axios'
import Cookies from 'js-cookie'

const baseUrl = 'http://localhost:8000/';

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  
    
})

AxiosInstance.interceptors.request.use(
 
    (config) => {
        const csrf = Cookies.get('csrftoken')
        if (csrf) config.headers['X-CSRFToken'] = csrf
        return config
    }
)
AxiosInstance.interceptors.response.use(
    (response) => {
        console.log("Status:", response.status);
        console.log("Headers:", response.headers);
        console.log("Data:", response.data);
        return response;
    },
    (error) => {
        console.log("API error:", error.response?.status, error.response?.data);
        return Promise.reject(error)
    }
)
export default AxiosInstance