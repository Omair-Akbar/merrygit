import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import * as groupApi from "@/lib/api/group-api"
import type { Group, CreateGroupRequest, UpdateGroupRequest, GroupMember, GroupWithDetails } from "@/lib/api/group-api"

// Re-export GroupWithDetails so chat-page.tsx can import it
export type { GroupWithDetails }

interface GroupState {
  creatingGroup: Group | null
  selectedGroup: Group | null
  groups: GroupWithDetails[]
  groupMembers: GroupMember[]
  isLoadingCreate: boolean
  isLoadingUploadAvatar: boolean
  isLoadingDeleteAvatar: boolean
  isLoadingUpdate: boolean
  isLoadingGetMembers: boolean
  isLoadingInviteMember: boolean
  isLoadingRemoveMember: boolean
  isLoadingUpdateMemberRole: boolean
  isLoadingGroups: boolean
  errorCreate: string | null
  errorUploadAvatar: string | null
  errorDeleteAvatar: string | null
  errorUpdate: string | null
  errorGetMembers: string | null
  errorInviteMember: string | null
  errorRemoveMember: string | null
  errorUpdateMemberRole: string | null
  errorGroups: string | null
}

const initialState: GroupState = {
  creatingGroup: null,
  selectedGroup: null,
  groups: [],
  groupMembers: [],
  isLoadingCreate: false,
  isLoadingUploadAvatar: false,
  isLoadingDeleteAvatar: false,
  isLoadingUpdate: false,
  isLoadingGetMembers: false,
  isLoadingInviteMember: false,
  isLoadingRemoveMember: false,
  isLoadingUpdateMemberRole: false,
  isLoadingGroups: false,
  errorCreate: null,
  errorUploadAvatar: null,
  errorDeleteAvatar: null,
  errorUpdate: null,
  errorGetMembers: null,
  errorInviteMember: null,
  errorRemoveMember: null,
  errorUpdateMemberRole: null,
  errorGroups: null,
}

export const createGroupThunk = createAsyncThunk(
  "group/createGroup",
  async (data: CreateGroupRequest, { rejectWithValue }) => {
    try {
      const response = await groupApi.createGroup(data)
      return response.group
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create group")
    }
  },
)

export const getGroupsThunk = createAsyncThunk(
  "group/getGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupApi.getGroups()
      return response.data.groups
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch groups")
    }
  },
)

export const uploadGroupAvatarThunk = createAsyncThunk(
  "group/uploadAvatar",
  async ({ groupId, file }: { groupId: string; file: File }, { rejectWithValue }) => {
    try {
      const response = await groupApi.uploadGroupAvatar(groupId, file)
      return response.group
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload avatar")
    }
  },
)

export const deleteGroupAvatarThunk = createAsyncThunk(
  "group/deleteAvatar",
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await groupApi.deleteGroupAvatar(groupId)
      return response.group
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete avatar")
    }
  },
)

export const updateGroupThunk = createAsyncThunk(
  "group/updateGroup",
  async ({ groupId, data }: { groupId: string; data: UpdateGroupRequest }, { rejectWithValue }) => {
    try {
      const response = await groupApi.updateGroup(groupId, data)
      return response.group
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update group")
    }
  },
)

export const getGroupMembersThunk = createAsyncThunk(
  "group/getMembers",
  async (groupId: string, { rejectWithValue }) => {
    try {
      const response = await groupApi.getGroupMembers(groupId)
      return response.members
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch group members")
    }
  },
)

export const inviteGroupMemberThunk = createAsyncThunk(
  "group/inviteMember",
  async ({ groupId, memberId }: { groupId: string; memberId: string }, { rejectWithValue }) => {
    try {
      const response = await groupApi.inviteGroupMember(groupId, { memberId })
      return response.member
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to invite member")
    }
  },
)

export const removeGroupMemberThunk = createAsyncThunk(
  "group/removeMember",
  async ({ groupId, memberId }: { groupId: string; memberId: string }, { rejectWithValue }) => {
    try {
      await groupApi.removeGroupMember(groupId, memberId)
      return memberId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove member")
    }
  },
)

export const updateMemberRoleThunk = createAsyncThunk(
  "group/updateMemberRole",
  async (
    { groupId, memberId, role }: { groupId: string; memberId: string; role: "owner" | "admin" | "member" },
    { rejectWithValue },
  ) => {
    try {
      const response = await groupApi.updateMemberRole(groupId, memberId, { role })
      return response.member
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update member role")
    }
  },
)

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload
    },
    clearCreatingGroup: (state) => {
      state.creatingGroup = null
      state.errorCreate = null
    },
    clearErrors: (state) => {
      state.errorCreate = null
      state.errorUploadAvatar = null
      state.errorDeleteAvatar = null
      state.errorUpdate = null
      state.errorGroups = null
      state.errorGetMembers = null
      state.errorInviteMember = null
      state.errorRemoveMember = null
      state.errorUpdateMemberRole = null
    },
  },
  extraReducers: (builder) => {
    // Create Group
    builder
      .addCase(createGroupThunk.pending, (state) => {
        state.isLoadingCreate = true
        state.errorCreate = null
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        state.isLoadingCreate = false
        state.creatingGroup = action.payload
        state.errorCreate = null
      })
      .addCase(createGroupThunk.rejected, (state, action) => {
        state.isLoadingCreate = false
        state.errorCreate = action.payload as string
      })

    // Get Groups
    builder
      .addCase(getGroupsThunk.pending, (state) => {
        state.isLoadingGroups = true
        state.errorGroups = null
      })
      .addCase(getGroupsThunk.fulfilled, (state, action) => {
        state.isLoadingGroups = false
        state.groups = action.payload
        state.errorGroups = null
      })
      .addCase(getGroupsThunk.rejected, (state, action) => {
        state.isLoadingGroups = false
        state.errorGroups = action.payload as string
      })

    // Upload Avatar
    builder
      .addCase(uploadGroupAvatarThunk.pending, (state) => {
        state.isLoadingUploadAvatar = true
        state.errorUploadAvatar = null
      })
      .addCase(uploadGroupAvatarThunk.fulfilled, (state, action) => {
        state.isLoadingUploadAvatar = false
        state.creatingGroup = action.payload
        state.errorUploadAvatar = null
      })
      .addCase(uploadGroupAvatarThunk.rejected, (state, action) => {
        state.isLoadingUploadAvatar = false
        state.errorUploadAvatar = action.payload as string
      })

    // Delete Avatar
    builder
      .addCase(deleteGroupAvatarThunk.pending, (state) => {
        state.isLoadingDeleteAvatar = true
        state.errorDeleteAvatar = null
      })
      .addCase(deleteGroupAvatarThunk.fulfilled, (state, action) => {
        state.isLoadingDeleteAvatar = false
        state.creatingGroup = action.payload
        state.errorDeleteAvatar = null
      })
      .addCase(deleteGroupAvatarThunk.rejected, (state, action) => {
        state.isLoadingDeleteAvatar = false
        state.errorDeleteAvatar = action.payload as string
      })

    // Update Group
    builder
      .addCase(updateGroupThunk.pending, (state) => {
        state.isLoadingUpdate = true
        state.errorUpdate = null
      })
      .addCase(updateGroupThunk.fulfilled, (state, action) => {
        state.isLoadingUpdate = false
        state.creatingGroup = action.payload
        state.errorUpdate = null
      })
      .addCase(updateGroupThunk.rejected, (state, action) => {
        state.isLoadingUpdate = false
        state.errorUpdate = action.payload as string
      })

    // Get Members
    builder
      .addCase(getGroupMembersThunk.pending, (state) => {
        state.isLoadingGetMembers = true
        state.errorGetMembers = null
      })
      .addCase(getGroupMembersThunk.fulfilled, (state, action) => {
        state.isLoadingGetMembers = false
        state.groupMembers = action.payload
        state.errorGetMembers = null
      })
      .addCase(getGroupMembersThunk.rejected, (state, action) => {
        state.isLoadingGetMembers = false
        state.errorGetMembers = action.payload as string
      })

    // Invite Member
    builder
      .addCase(inviteGroupMemberThunk.pending, (state) => {
        state.isLoadingInviteMember = true
        state.errorInviteMember = null
      })
      .addCase(inviteGroupMemberThunk.fulfilled, (state) => {
        state.isLoadingInviteMember = false
        state.errorInviteMember = null
      })
      .addCase(inviteGroupMemberThunk.rejected, (state, action) => {
        state.isLoadingInviteMember = false
        state.errorInviteMember = action.payload as string
      })

    // Remove Member
    builder
      .addCase(removeGroupMemberThunk.pending, (state) => {
        state.isLoadingRemoveMember = true
        state.errorRemoveMember = null
      })
      .addCase(removeGroupMemberThunk.fulfilled, (state, action) => {
        state.isLoadingRemoveMember = false
        state.groupMembers = state.groupMembers.filter((m) => m.user._id !== action.payload)
        state.errorRemoveMember = null
      })
      .addCase(removeGroupMemberThunk.rejected, (state, action) => {
        state.isLoadingRemoveMember = false
        state.errorRemoveMember = action.payload as string
      })

    // Update Member Role
    builder
      .addCase(updateMemberRoleThunk.pending, (state) => {
        state.isLoadingUpdateMemberRole = true
        state.errorUpdateMemberRole = null
      })
      .addCase(updateMemberRoleThunk.fulfilled, (state, action) => {
        state.isLoadingUpdateMemberRole = false
        state.errorUpdateMemberRole = null

        const updatedMember = action.payload
        state.groupMembers = state.groupMembers.map((member) =>
          member.user._id === updatedMember.userId
            ? { ...member, role: updatedMember.newRole }
            : member,
        )
      })
      .addCase(updateMemberRoleThunk.rejected, (state, action) => {
        state.isLoadingUpdateMemberRole = false
        state.errorUpdateMemberRole = action.payload as string
      })
  },
})

export const { setSelectedGroup, clearCreatingGroup, clearErrors } = groupSlice.actions
export default groupSlice.reducer