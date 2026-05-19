// types/user.ts

// Base user interface matching the backend response
export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  phoneVisibility: 'only_me' | 'everyone' | 'only_friends';
  avatar: string | null;
  lastSeen: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean; // Optional as it appears in some responses
}

// Auth Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  username: string;
  phoneNumber: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// Update Profile Types
export interface UpdateProfileRequest {
  name?: string;
  username?: string;
  phoneNumber?: string;
  phoneVisibility?: 'only_me' | 'everyone' | 'only_friends';
  timezone?: string;
}

// Password Types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOTPRequest {
  email: string;
  otp: string;
}

// API Response Types
export interface AuthResponse {
  message: string;
  userData?: User;
}

export interface LoginResponse {
  message: string;
  userData: User;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyResponse {
  message: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface UpdateAvatarResponse {
  message: string;
  user: User;
}

export interface UserProfileResponse {
  user: User;
}

export interface SearchUserResponse {
  user: User;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetOTPResponse {
  message: string;
}

// Unified response type for all user API endpoints
export type UserApiResponse<T = unknown> = T;

// API Endpoints type for type-safe endpoint references
export const USER_API_ENDPOINTS = {
  LOGIN: '/api/v1/user/login',
  REGISTER: '/api/v1/user/register',
  VERIFY: '/api/v1/user/verify',
  LOGOUT: '/api/v1/user/logout',
  UPDATE: '/api/v1/user/update',
  UPDATE_AVATAR: '/api/v1/user/update-avatar',
  ME: '/api/v1/user/me',
  USER_BY_ID: (id: string) => `/api/v1/user/${id}`,
  SEARCH: '/api/v1/user/search',
  CHANGE_PASSWORD: '/api/v1/user/change-password',
  FORGOT_PASSWORD: '/api/v1/user/forgot-password',
  VERIFY_RESET_OTP: '/api/v1/user/verify-reset-otp',
} as const;

// Type for the endpoint values
export type UserApiEndpoint = typeof USER_API_ENDPOINTS[keyof typeof USER_API_ENDPOINTS];

// Generic API error type
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Helper type to extract response type based on endpoint
export type UserEndpointResponses = {
  [USER_API_ENDPOINTS.LOGIN]: LoginResponse;
  [USER_API_ENDPOINTS.REGISTER]: RegisterResponse;
  [USER_API_ENDPOINTS.VERIFY]: VerifyResponse;
  [USER_API_ENDPOINTS.LOGOUT]: LogoutResponse;
  [USER_API_ENDPOINTS.UPDATE]: UpdateProfileResponse;
  [USER_API_ENDPOINTS.UPDATE_AVATAR]: UpdateAvatarResponse;
  [USER_API_ENDPOINTS.ME]: UserProfileResponse;
  [USER_API_ENDPOINTS.SEARCH]: SearchUserResponse;
  [USER_API_ENDPOINTS.CHANGE_PASSWORD]: ChangePasswordResponse;
  [USER_API_ENDPOINTS.FORGOT_PASSWORD]: ForgotPasswordResponse;
  [USER_API_ENDPOINTS.VERIFY_RESET_OTP]: VerifyResetOTPResponse;
};