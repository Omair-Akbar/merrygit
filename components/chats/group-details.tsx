"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Trash2, Users, UserMinus, Crown, Shield, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import {
  uploadGroupAvatarThunk,
  deleteGroupAvatarThunk,
  updateGroupThunk,
  getGroupMembersThunk,
  removeGroupMemberThunk,
  updateMemberRoleThunk,
} from "@/lib/store/slices/group-slice"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { UserDetailsModal } from "@/components/ui/user-details-modal"
import { AddMemberModal } from "./add-member-modal"
import type { Group, GroupSettings } from "@/lib/api/group-api"
import { toast } from "react-hot-toast"

interface GroupDetailsProps {
  group: Group
  onBack: () => void
}

export function GroupDetails({ group, onBack }: GroupDetailsProps) {
  const dispatch = useAppDispatch()
  const {
    isLoadingUploadAvatar,
    isLoadingDeleteAvatar,
    isLoadingUpdate,
    groupMembers,
    isLoadingGetMembers,
    isLoadingUpdateMemberRole,
    isLoadingRemoveMember,
  } = useAppSelector((state) => state.group)

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [settings, setSettings] = useState<GroupSettings>(group.settings)
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    memberId: string
    memberName: string
  }>({ open: false, memberId: "", memberName: "" })
  const [userDetailsModal, setUserDetailsModal] = useState<{
    open: boolean
    memberId?: string
    role?: "owner" | "admin" | "member"
  }>({ open: false })
  const [addMemberModal, setAddMemberModal] = useState(false)

  // Fetch group members on mount
  useEffect(() => {
    dispatch(getGroupMembersThunk(group._id))
  }, [group._id, dispatch])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewAvatar(url)

    dispatch(uploadGroupAvatarThunk({ groupId: group._id, file }))
      .unwrap()
      .then(() => {
        toast.success("Avatar uploaded successfully")
        setPreviewAvatar(null)
      })
      .catch(() => {
        toast.error("Failed to upload avatar")
        setPreviewAvatar(null)
      })
  }

  const handleDeleteAvatar = () => {
    setConfirmModal({
      open: true,
      memberId: "avatar",
      memberName: "group avatar",
    })
  }

  const confirmDeleteAvatar = () => {
    setConfirmModal({ open: false, memberId: "", memberName: "" })
    dispatch(deleteGroupAvatarThunk(group._id))
      .unwrap()
      .then(() => {
        toast.success("Avatar deleted successfully")
      })
      .catch(() => {
        toast.error("Failed to delete avatar")
      })
  }

  const handleSaveSettings = () => {
    if (!name.trim()) {
      toast.error("Group name cannot be empty")
      return
    }

    dispatch(
      updateGroupThunk({
        groupId: group._id,
        data: {
          name: name.trim(),
          description: description.trim(),
          settings,
        },
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Group updated successfully")
        setIsEditing(false)
      })
      .catch(() => {
        toast.error("Failed to update group")
      })
  }

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setConfirmModal({
      open: true,
      memberId,
      memberName,
    })
  }

  const confirmRemoveMember = () => {
    const { memberId, memberName } = confirmModal
    setConfirmModal({ open: false, memberId: "", memberName: "" })

    dispatch(removeGroupMemberThunk({ groupId: group._id, memberId }))
      .unwrap()
      .then(() => {
        toast.success(`${memberName} removed from the group`)
      })
      .catch(() => {
        toast.error("Failed to remove member")
      })
  }

  const handleUpdateRole = (memberId: string, newRole: "admin" | "member") => {
    dispatch(
      updateMemberRoleThunk({
        groupId: group._id,
        memberId,
        role: newRole,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Member role updated successfully")
      })
      .catch(() => {
        toast.error("Failed to update member role")
      })
  }

  const handleUserDetailsClick = (member: any) => {
    setUserDetailsModal({
      open: true,
      memberId: member.user._id,
      role: member.role,
    })
  }

  const displayAvatar = previewAvatar || group.avatar
  const currentMember = userDetailsModal.memberId
    ? groupMembers.find((m) => m.user._id === userDetailsModal.memberId)
    : null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Group Details</h2>
              <p className="text-sm text-muted-foreground">Manage group information and members.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 top-0 z-10 bg-transparent pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground">Update group info and settings.</p>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                className="bg-black/10 dark:bg-white dark:text-black"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoadingUpdate}
                >
                  Edit settings
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setName(group.name)
                      setDescription(group.description)
                      setSettings(group.settings)
                    }}
                    disabled={isLoadingUpdate}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveSettings}
                    disabled={isLoadingUpdate}
                    className="dark:bg-white"
                  >
                    Save changes
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="rounded-lg border border-border p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Group Avatar</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {displayAvatar ? (
                      <AvatarImage src={displayAvatar} alt={group.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                      {group.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {isLoadingUploadAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="avatar-input" className="cursor-pointer">
                    <Button asChild variant="secondary" size="sm" className="gap-2" disabled={isLoadingUploadAvatar}>
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload new avatar
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isLoadingUploadAvatar}
                    className="hidden"
                  />
                  {group.avatar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={isLoadingDeleteAvatar}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete avatar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="rounded-lg border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Information</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group name</Label>
                  <Input
                    id="group-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">Description</Label>
                  <textarea
                    id="group-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isEditing}
                    className="w-full min-h-20 px-3 py-2 rounded-md border border-border bg-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Group is created on:</span> {formatDate(group.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Last update:</span>{" "}
                  {group.updatedAt ? formatDate(group.updatedAt) : "Not updated yet"}
                </p>
              </div>
            </div>

            {/* Settings Section */}
            <div className="rounded-lg border border-border p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-medium">Anyone can add members</p>
                    <p className="text-xs text-muted-foreground">Allow any member to invite others.</p>
                  </div>
                  <Switch
                    checked={settings.anyoneCanAddMembers}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, anyoneCanAddMembers: checked }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-medium">Only admins can send messages</p>
                    <p className="text-xs text-muted-foreground">Restrict messaging to admins only.</p>
                  </div>
                  <Switch
                    checked={settings.onlyAdminsCanSendMessages}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, onlyAdminsCanSendMessages: checked }))
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
                  <div>
                    <p className="text-sm font-medium">Members can edit group info</p>
                    <p className="text-xs text-muted-foreground">Let members update name or description.</p>
                  </div>
                  <Switch
                    checked={settings.membersCanEditGroupInfo}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, membersCanEditGroupInfo: checked }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div className="rounded-lg border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-black dark:bg-white">{groupMembers.length} total</Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1"
                    onClick={() => setAddMemberModal(true)}
                  >
                    <UserPlus className="h-3 w-3" />
                    Add member
                  </Button>
                </div>
              </div>

              {isLoadingGetMembers ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading members...</p>
              ) : groupMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No members in this group.</p>
              ) : (
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div
                      key={member.user._id}
                      className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleUserDetailsClick(member)}
                          className="hover:opacity-75 transition-opacity"
                        >
                          <Avatar className="h-10 w-10 cursor-pointer">
                            {member.user.avatar ? (
                              <AvatarImage src={member.user.avatar} alt={member.user.name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              {member.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{member.user.username}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={member.status === "pending" ? "secondary" : "outline"}>
                          {member.status === "pending" ? "Pending" : "Active"}
                        </Badge>

                        {member.role === "owner" ? (
                          <Badge variant="outline" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        ) : member.role === "admin" ? (
                          <div className="flex items-center gap-1">
                            <Select
                              value={member.role}
                              onValueChange={(value) =>
                                handleUpdateRole(member.user._id, value as "admin" | "member")
                              }
                              disabled={isLoadingUpdateMemberRole}
                            >
                              <SelectTrigger size="sm" className="min-w-24">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin" className="gap-1">
                                  <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Admin
                                  </span>
                                </SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              handleUpdateRole(member.user._id, value as "admin" | "member")
                            }
                            disabled={isLoadingUpdateMemberRole}
                          >
                            <SelectTrigger size="sm" className="min-w-24">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin" className="gap-1">
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  Admin
                                </span>
                              </SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.user._id, member.user.name)}
                            disabled={isLoadingRemoveMember}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {isLoadingRemoveMember && confirmModal.memberId === member.user._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserMinus className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={
          confirmModal.memberId === "avatar" ? "Delete group avatar?" : `Remove ${confirmModal.memberName}?`
        }
        subtitle={
          confirmModal.memberId === "avatar"
            ? "This action cannot be undone."
            : `Are you sure you want to remove ${confirmModal.memberName} from this group?`
        }
        confirmText={confirmModal.memberId === "avatar" ? "Delete" : "Remove"}
        cancelText="Cancel"
        variant="destructive"
        isLoading={
          confirmModal.memberId === "avatar" ? isLoadingDeleteAvatar : isLoadingRemoveMember
        }
        onConfirm={confirmModal.memberId === "avatar" ? confirmDeleteAvatar : confirmRemoveMember}
        onCancel={() => setConfirmModal({ open: false, memberId: "", memberName: "" })}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        open={userDetailsModal.open}
        user={
          currentMember
            ? {
                name: currentMember.user.name,
                username: currentMember.user.username,
                email: currentMember.user.email,
                avatar: currentMember.user.avatar,
                timezone: currentMember.user.timezone,
              }
            : undefined
        }
        role={userDetailsModal.role}
        onOpenChange={(open) => setUserDetailsModal({ ...userDetailsModal, open })}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        open={addMemberModal}
        groupId={group._id}
        onOpenChange={setAddMemberModal}
        onSuccess={() => {
          setAddMemberModal(false)
          dispatch(getGroupMembersThunk(group._id))
        }}
      />
    </>
  )
}
