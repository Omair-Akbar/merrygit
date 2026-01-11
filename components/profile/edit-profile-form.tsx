"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { updateProfile, uploadAvatar, deleteAvatar, clearError, clearSuccess } from "@/lib/store/slices/profile-slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, Trash2, X } from "lucide-react"
import { toast } from "react-hot-toast"
import Cropper, { Area } from "react-easy-crop"

export function EditProfileForm() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { isLoading, error, success } = useAppSelector((state) => state.profile)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
  })

  const [initialFormData, setInitialFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Check if form has changes
  const hasFormChanges = 
    formData.name !== initialFormData.name ||
    formData.username !== initialFormData.username ||
    formData.phoneNumber !== initialFormData.phoneNumber

  useEffect(() => {
    if (user) {
      setInitialFormData({
        name: user.name || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
      })
      setFormData({
        name: user.name || "",
        username: user.username || "",
        phoneNumber: user.phoneNumber || "",
      })
    }
  }, [user])

  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully!")
      dispatch(clearSuccess())
      setInitialFormData(formData)
    }
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [success, error, dispatch, formData])

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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await dispatch(
      updateProfile({
        name: formData.name,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
      })
    )
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setIsAvatarDialogOpen(true)
    }
    reader.readAsDataURL(file)

    // Reset file input
    e.target.value = ""
  }

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const createCroppedImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!selectedImage || !croppedAreaPixels) {
        reject(new Error("No image selected"))
        return
      }

      const image = new Image()
      image.src = selectedImage

      image.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        )

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
          },
          "image/jpeg",
          0.95
        )
      }

      image.onerror = () => {
        reject(new Error("Failed to load image"))
      }
    })
  }

  const handleAvatarUpload = async () => {
    if (!selectedImage || !croppedAreaPixels) {
      toast.error("Please select and crop an image")
      return
    }

    try {
      setIsUploadingAvatar(true)
      const croppedImageBlob = await createCroppedImage()
      
      // Create a File from the Blob
      const file = new File([croppedImageBlob], "avatar.jpg", {
        type: "image/jpeg",
      })

      // Dispatch the upload action
      const result = await dispatch(uploadAvatar(file))
      
      if (uploadAvatar.fulfilled.match(result)) {
        toast.success("Avatar uploaded successfully!")
        setIsAvatarDialogOpen(false)
        setSelectedImage(null)
      } else {
        toast.error("Failed to upload avatar")
      }
    } catch (error) {
      console.error("Error cropping image:", error)
      toast.error("Failed to process image")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (window.confirm("Are you sure you want to delete your avatar?")) {
      await dispatch(deleteAvatar())
    }
  }

  return (
    <>
      {/* Avatar Dialog */}
      {isAvatarDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold">Crop Profile Picture</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsAvatarDialogOpen(false)
                  setSelectedImage(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {selectedImage && (
                  <Cropper
                    image={selectedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    cropShape="round"
                    showGrid={false}
                    style={{
                      containerStyle: {
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#f3f4f6",
                      },
                    }}
                  />
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zoom-range">Zoom</Label>
                  <Input
                    id="zoom-range"
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      setIsAvatarDialogOpen(false)
                      setSelectedImage(null)
                    }}
                    disabled={isUploadingAvatar}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 dark:text-black dark:bg-white"
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Avatar"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="space-y-4">
          <Label>Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-60 w-60">
              <AvatarImage src={user?.avatar || ""} alt={user?.name} className="object-cover" />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => document.getElementById("avatar-input")?.click()}
                className="cursor-pointer dark:text-black dark:bg-white hover:dark:bg-gray-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              {user?.avatar && (
                <Button type="button" variant="destructive" size="sm" disabled={isLoading} onClick={handleAvatarDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
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
              className={`p-3 ${errors.name ? "border-destructive" : "border-accent-foreground/30"}`}
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
              className={`p-3 ${errors.username ? "border-destructive" : "border-accent-foreground/30"}`}
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
              className={`p-3 ${errors.phoneNumber ? "border-destructive" : "border-accent-foreground/30"}`}
            />
            {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full dark:text-black dark:bg-white" 
            disabled={isLoading || !hasFormChanges}
          >
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
    </>
  )
}
