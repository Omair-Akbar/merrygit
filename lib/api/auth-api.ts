import apiInstance from "./axios-instance"

export interface RegisterRequest {
  name: string
  username: string
  email: string
  password: string
  phoneNumber: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  _id: string
  name: string
  username: string
  email: string
  phoneNumber: string
  phoneVisibility: string
  avatar: string | null
  lastSeen: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  user?: User
  userData?: User
}

// Register user - sends OTP to email
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiInstance.post<AuthResponse>("/user/register", data)
  return response.data
}

// Verify OTP and create account
export const verifyOtp = async (data: VerifyOtpRequest): Promise<{ message: string; user: User }> => {
  const response = await apiInstance.post<{ message: string; user: User }>("/user/verify", data)
  return response.data
}

// Login user
export const loginUser = async (data: LoginRequest): Promise<{ message: string; userData: User }> => {
  const response = await apiInstance.post<{ message: string; userData: User }>("/user/login", data)
  return response.data
}

// Get current user
export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await apiInstance.get<{ user: User }>("/user/me")
  return response.data
}

// Logout user
export const logoutUser = async (): Promise<{ message: string }> => {
  const response = await apiInstance.get<{ message: string }>("/user/logout")
  return response.data
}

export default apiInstance
