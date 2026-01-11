import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://merrygit-user-service.onrender.com/api/v1"

export const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - user will be logged out by auth slice
      localStorage.removeItem("auth_initialized")
    }
    return Promise.reject(error)
  },
)

export default apiInstance
