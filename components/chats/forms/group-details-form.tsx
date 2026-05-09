"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { GroupSettings } from "@/lib/api/group-api"

interface GroupDetailsFormProps {
  name: string
  description: string
  settings: GroupSettings
  isLoading: boolean
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSettingsChange: (settings: GroupSettings) => void
  onNext: () => void
  onCancel: () => void
}

export function GroupDetailsForm({
  name,
  description,
  settings,
  isLoading,
  onNameChange,
  onDescriptionChange,
  onSettingsChange,
  onNext,
  onCancel,
}: GroupDetailsFormProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Create group</h2>
            <p className="text-sm text-muted-foreground">Add details and settings for your group.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Personal talk"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="This is a group for personal discussion"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Group Settings</h3>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Anyone can add members</p>
                <p className="text-xs text-muted-foreground">Allow any member to invite others.</p>
              </div>
              <Switch
                checked={settings.anyoneCanAddMembers}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, anyoneCanAddMembers: checked })
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Only admins can send messages</p>
                <p className="text-xs text-muted-foreground">Restrict messaging to admins only.</p>
              </div>
              <Switch
                checked={settings.onlyAdminsCanSendMessages}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, onlyAdminsCanSendMessages: checked })
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Members can edit group info</p>
                <p className="text-xs text-muted-foreground">Let members update name or description.</p>
              </div>
              <Switch
                checked={settings.membersCanEditGroupInfo}
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, membersCanEditGroupInfo: checked })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={onNext} disabled={name.trim().length === 0 || isLoading} className="dark:bg-white">
              Next: Add avatar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
