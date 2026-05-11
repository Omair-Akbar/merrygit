"use client"

import { useState } from "react"
import { ArrowLeft, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import {
  uploadGroupAvatarThunk,
  deleteGroupAvatarThunk,
  updateGroupThunk,
} from "@/lib/store/slices/group-slice"
import type { Group, GroupSettings } from "@/lib/api/group-api"
import { toast } from "react-hot-toast"

interface GroupDetailsProps {
  group: Group
  onBack: () => void
}

export function GroupDetails({ group, onBack }: GroupDetailsProps) {
  const dispatch = useAppDispatch()
  const { isLoadingUploadAvatar, isLoadingDeleteAvatar, isLoadingUpdate, errorUploadAvatar, errorDeleteAvatar, errorUpdate } =
    useAppSelector((state) => state.group)

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [settings, setSettings] = useState<GroupSettings>(group.settings)

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
        toast.error(errorUploadAvatar || "Failed to upload avatar")
        setPreviewAvatar(null)
      })
  }

  const handleDeleteAvatar = () => {
    if (window.confirm("Are you sure you want to delete the group avatar?")) {
      dispatch(deleteGroupAvatarThunk(group._id))
        .unwrap()
        .then(() => {
          toast.success("Avatar deleted successfully")
        })
        .catch(() => {
          toast.error(errorDeleteAvatar || "Failed to delete avatar")
        })
    }
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
        toast.error(errorUpdate || "Failed to update group")
      })
  }

  const displayAvatar = previewAvatar || group.avatar

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Group Details</h2>
            <p className="text-sm text-muted-foreground">Manage group information and settings.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Group Avatar</h3>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                {displayAvatar ? <AvatarImage src={displayAvatar} alt={group.name} /> : null}
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {group.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Label htmlFor="avatar-input" className="cursor-pointer">
                  <Button asChild variant="secondary" size="sm" className="gap-2">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group name</Label>
                <input
                  id="group-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <textarea
                  id="group-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isEditing}
                  className="w-full min-h-20 px-3 py-2 rounded-md border border-border bg-background disabled:opacity-50"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setName(group.name)
                      setDescription(group.description)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={isLoadingUpdate}>
                    Save changes
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </p>
              {group.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(group.updatedAt).toLocaleDateString()}
                </p>
              )}
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

            {!isEditing && (
              <div className="flex justify-end pt-2">
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit settings
                </Button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="rounded-lg border border-border/60 p-4 bg-muted/30">
            <h4 className="text-sm font-semibold mb-3">Group Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Members</span>
                <Badge>{group.memberCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Group ID</span>
                <code className="text-xs bg-background px-2 py-1 rounded">{group._id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
