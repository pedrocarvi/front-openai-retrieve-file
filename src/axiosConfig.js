import axios from "axios";

const apiClient = axios.create({
    // TODO: cambiar a URL de la api deployada
    baseURL: 'http://localhost:5001'
})

// Interceptores
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
})

export default apiClient;