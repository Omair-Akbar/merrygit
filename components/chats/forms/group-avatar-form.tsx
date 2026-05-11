"use client"

import { useState } from "react"
import { Upload, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"

interface GroupAvatarFormProps {
  groupName: string
  avatarFile: File | null
  avatarPreview: string | null
  isLoading: boolean
  onAvatarChange: (file: File) => void
  onAvatarRemove: () => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onCancel: () => void
}

export function GroupAvatarForm({
  groupName,
  avatarFile,
  avatarPreview,
  isLoading,
  onAvatarChange,
  onAvatarRemove,
  onNext,
  onBack,
  onSkip,
  onCancel,
}: GroupAvatarFormProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    onAvatarChange(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Group avatar</h2>
            <p className="text-sm text-muted-foreground">Upload an optional profile picture for your group.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-border p-8 transition-colors" style={isDragging ? { borderColor: "hsl(var(--accent))" } : {}}>
            {avatarPreview ? (
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarPreview} alt="Group avatar preview" className="object-cover" />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                  {groupName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-32 w-32 bg-secondary">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                  {groupName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className="flex flex-col items-center gap-3 w-full"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Label htmlFor="avatar-input" className="cursor-pointer">
                <Button asChild className="gap-2 dark:bg-white" disabled={isLoading}>
                  <span>
                    <Upload className="h-4 w-4" />
                    Choose or drag image here
                  </span>
                </Button>
              </Label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                disabled={isLoading}
                className="hidden"
              />

              {avatarPreview && (
                <Button
                  variant="outline"
                  onClick={onAvatarRemove}
                  disabled={isLoading}
                  className="gap-2 text-destructive hover:text-destructive w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove image
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center">
                PNG, JPG, GIF • Max 5MB
              </p>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="secondary" onClick={onBack} disabled={isLoading}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onSkip}
                disabled={isLoading || !avatarFile}
              >
                Skip
              </Button>
              <Button
                onClick={onNext}
                disabled={!avatarFile || isLoading}
                className="gap-2 dark:bg-white"
              >
                Next: Add members
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
