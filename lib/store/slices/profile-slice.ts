import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import * as profileApi from "@/lib/api/profile-api"

interface ProfileState {
  isLoading: boolean
  error: string | null
  success: boolean
}

const initialState: ProfileState = {
  isLoading: false,
  error: null,
  success: false,
}

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (data: profileApi.UpdateProfileRequest, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateProfile(data)
      return response.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Profile update failed")
    }
  },
)

export const uploadAvatar = createAsyncThunk("profile/uploadAvatar", async (file: File, { rejectWithValue }) => {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file")
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    const response = await profileApi.uploadAvatar(file)
    return response.user
  } catch (error: any) {
    return rejectWithValue(error.message || error.response?.data?.message || "Avatar upload failed")
  }
})

export const deleteAvatar = createAsyncThunk("profile/deleteAvatar", async (_, { rejectWithValue }) => {
  try {
    const response = await profileApi.deleteAvatar()
    return response.user
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Avatar deletion failed")
  }
})

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
  },
  extraReducers: (builder) => {
    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.isLoading = false
        state.success = true
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Upload avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadAvatar.fulfilled, (state) => {
        state.isLoading = false
        state.success = true
        state.error = null
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete avatar
    builder
      .addCase(deleteAvatar.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAvatar.fulfilled, (state) => {
        state.isLoading = false
        state.success = true
        state.error = null
      })
      .addCase(deleteAvatar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearSuccess } = profileSlice.actions
export default profileSlice.reducer
