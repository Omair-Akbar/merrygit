import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import * as authApi from "@/lib/api/auth-api"
import type { User } from "@/lib/api/auth-api"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  otpEmail: string | null
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  otpEmail: null,
  isInitialized: false,
}

// Async thunks for auth operations
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data: authApi.RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.registerUser(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed")
    }
  },
)

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: authApi.VerifyOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(data)
      return response.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "OTP verification failed")
    }
  },
)

export const loginUser = createAsyncThunk("auth/loginUser", async (data: authApi.LoginRequest, { rejectWithValue }) => {
  try {
    const response = await authApi.loginUser(data)
    return response.userData
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed")
  }
})

export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getCurrentUser()
    return response.user
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user")
  }
})

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    await authApi.logoutUser()
    return null
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Logout failed")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOtpEmail: (state, action) => {
      state.otpEmail = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setIsInitialized: (state, action) => {
      state.isInitialized = action.payload
    },
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.otpEmail = action.meta.arg.email
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.otpEmail = null
        state.error = null
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.isInitialized = true
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.isInitialized = true
        state.isAuthenticated = false
        state.user = null
      })

    // Logout user
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
        state.otpEmail = null
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { setOtpEmail, clearError, setIsInitialized } = authSlice.actions
export default authSlice.reducer
