"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { updateProfile, uploadAvatar, deleteAvatar, clearError, clearSuccess } from "@/lib/store/slices/profile-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"

export function EditProfileForm() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { isLoading, error, success } = useAppSelector((state) => state.profile)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully!")
      dispatch(clearSuccess())
    }
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [success, error, dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username))
      newErrors.username = "Username must be 3-20 characters (letters, numbers, underscore)"
    // if (!/^\d{10,}$/.test(formData.phoneNumber.replace(/\D/g, "")))
    //   newErrors.phoneNumber = "Phone number must be at least 10 digits"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await dispatch(
      updateProfile({
        name: formData.name,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
      }),
    )
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    await dispatch(uploadAvatar(file))
  }

  const handleAvatarDelete = async () => {
    if (window.confirm("Are you sure you want to delete your avatar?")) {
      await dispatch(deleteAvatar())
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="space-y-4">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-60 w-60">
            <AvatarImage src={user?.avatar || ""} alt={user?.name} className="object-cover" />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => document.getElementById("avatar-input")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            {user?.avatar && (
              <Button type="button" variant="outline" size="sm" disabled={isLoading} onClick={handleAvatarDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={` p-3 ${errors.username ? "border-destructive" : ""}`}
            required
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={` p-3 ${errors.username ? "border-destructive" : ""}`}
            required
          />
          {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={` p-3 ${errors.username ? "border-destructive" : ""}`}
            // required
          />
          {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
        </div>

        <Button type="submit" className="w-full dark:text-black dark:bg-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  )
}
