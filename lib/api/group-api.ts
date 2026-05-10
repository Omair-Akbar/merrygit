import apiInstance from "./axios-instance"
import axios from "axios"

// Create a separate instance for chat API to avoid circular dependency
const CHAT_API_BASE_URL =
  process.env.NEXT_PUBLIC_CHAT_API_BASE_URL || "http://localhost:5002/api/v1"

const chatApiInstance = axios.create({
  baseURL: CHAT_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export interface GroupSettings {
  anyoneCanAddMembers: boolean
  onlyAdminsCanSendMessages: boolean
  membersCanEditGroupInfo: boolean
}

export interface Group {
  _id: string
  name: string
  description: string
  avatar: string | null
  memberCount: number
  createdAt: string
  updatedAt?: string
  settings: GroupSettings
}

export interface CreateGroupRequest {
  name: string
  description: string
  settings: GroupSettings
}

export interface CreateGroupResponse {
  message: string
  group: Group
}

export interface UploadGroupAvatarResponse {
  message: string
  group: Group
}

export interface UpdateGroupRequest {
  name: string
  description: string
  settings: GroupSettings
}

export interface UpdateGroupResponse {
  message: string
  group: Group
}

export interface DeleteGroupAvatarResponse {
  message: string
  group: Group
}

// Get Groups Response
export interface GroupMemberUser {
  _id: string
  name: string
  username: string
  email: string
  phoneNumber: string
  phoneVisibility: string
  avatar: string | null
  isVerified: boolean
  lastSeen: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface GroupMemberData {
  user: GroupMemberUser
  role: "owner" | "admin" | "member"
  joinedAt: string
  addedBy: string
  status: "accepted" | "pending"
}

export interface GroupWithDetails {
  _id: string
  name: string
  description: string
  avatar: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  settings: GroupSettings
  memberCount: number
  members: GroupMemberData[]
  userRole: "owner" | "admin" | "member"
  unread: boolean
}

export interface GetGroupsResponse {
  message: string
  data: {
    groups: GroupWithDetails[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      itemsPerPage: number
      hasNextPage: boolean
      hasPrevPage: boolean
      nextPage: number | null
      prevPage: number | null
    }
  }
}

// Create a new group
export const createGroup = async (data: CreateGroupRequest): Promise<CreateGroupResponse> => {
  const response = await apiInstance.post<CreateGroupResponse>("/group", data)
  return response.data
}

// Get all groups
export const getGroups = async (): Promise<GetGroupsResponse> => {
  const response = await chatApiInstance.get<GetGroupsResponse>("/group")
  return response.data
}

// Upload group avatar
export const uploadGroupAvatar = async (groupId: string, file: File): Promise<UploadGroupAvatarResponse> => {
  const formData = new FormData()
  formData.append("avatar", file)

  const response = await apiInstance.post<UploadGroupAvatarResponse>(`/group/${groupId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

// Delete group avatar
export const deleteGroupAvatar = async (groupId: string): Promise<DeleteGroupAvatarResponse> => {
  const response = await apiInstance.delete<DeleteGroupAvatarResponse>(`/group/${groupId}/avatar`)
  return response.data
}

// Update group settings
export const updateGroup = async (groupId: string, data: UpdateGroupRequest): Promise<UpdateGroupResponse> => {
  const response = await apiInstance.put<UpdateGroupResponse>(`/group/${groupId}`, data)
  return response.data
}

// Member Management APIs
export interface GroupMember {
  user: {
    _id: string
    name: string
    username: string
    email: string
    avatar?: string
    lastSeen?: string
    timezone?: string
  }
  role: "owner" | "admin" | "member"
  joinedAt: string
  addedBy: string
  status: "accepted" | "pending"
}

export interface GetGroupMembersResponse {
  message: string
  members: GroupMember[]
  totalCount: number
  acceptedCount: number
  pendingCount: number
}

export interface InviteMemberRequest {
  memberId: string
}

export interface InviteMemberResponse {
  message: string
  member: {
    userId: string
    role: "owner" | "admin" | "member"
    status: "pending" | "accepted"
    addedBy: string
    invitedAt: string
  }
}

export interface UpdateMemberRoleRequest {
  role: "owner" | "admin" | "member"
}

export interface UpdateMemberRoleResponse {
  message: string
  member: {
    userId: string
    previousRole: "owner" | "admin" | "member"
    newRole: "owner" | "admin" | "member"
  }
}

export interface RemoveMemberResponse {
  message: string
}

// Get group members
export const getGroupMembers = async (groupId: string): Promise<GetGroupMembersResponse> => {
  const response = await apiInstance.get<GetGroupMembersResponse>(`/group/${groupId}/members`)
  return response.data
}

// Invite member to group
export const inviteGroupMember = async (
  groupId: string,
  data: InviteMemberRequest,
): Promise<InviteMemberResponse> => {
  const response = await apiInstance.post<InviteMemberResponse>(`/group/${groupId}/members`, data)
  return response.data
}

// Remove member from group
export const removeGroupMember = async (groupId: string, memberId: string): Promise<RemoveMemberResponse> => {
  const response = await apiInstance.delete<RemoveMemberResponse>(`/group/${groupId}/members/${memberId}`)
  return response.data
}

// Update member role
export const updateMemberRole = async (
  groupId: string,
  memberId: string,
  data: UpdateMemberRoleRequest,
): Promise<UpdateMemberRoleResponse> => {
  const response = await apiInstance.put<UpdateMemberRoleResponse>(
    `/group/${groupId}/members/${memberId}/role`,
    data,
  )
  return response.data
}

export default apiInstance