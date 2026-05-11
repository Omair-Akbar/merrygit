"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Users, Crown, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import {
  respondToGroupInvitationThunk,
  getGroupMembersThunk,
} from "@/lib/store/slices/group-slice"
import { UserDetailsModal } from "@/components/ui/user-details-modal"
import type { GroupWithDetails } from "@/lib/api/group-api"
import { toast } from "react-hot-toast"

interface PendingGroupInvitationProps {
  group: GroupWithDetails
  onBack: () => void
  onAccept?: () => void
}

export function PendingGroupInvitation({ group, onBack, onAccept }: PendingGroupInvitationProps) {
  const dispatch = useAppDispatch()
  const { isLoadingRespondInvitation, isLoadingGetMembers, groupMembers } = useAppSelector(
    (state) => state.group,
  )

  const [userDetailsModal, setUserDetailsModal] = useState<{
    open: boolean
    memberId?: string
    role?: "owner" | "admin" | "member"
  }>({ open: false })

  // Fetch group members on mount
  useEffect(() => {
    dispatch(getGroupMembersThunk(group._id))
  }, [group._id, dispatch])

  const handleAcceptInvitation = () => {
    dispatch(respondToGroupInvitationThunk({ groupId: group._id, action: "accept" }))
      .unwrap()
      .then(() => {
        toast.success("Successfully joined the group!")
        onAccept?.()
      })
      .catch(() => {
        toast.error("Failed to accept invitation")
      })
  }

  const handleRejectInvitation = () => {
    dispatch(respondToGroupInvitationThunk({ groupId: group._id, action: "decline" }))
      .unwrap()
      .then(() => {
        toast.success("Invitation declined")
        onBack()
      })
      .catch(() => {
        toast.error("Failed to decline invitation")
      })
  }

  const currentMember = userDetailsModal.memberId
    ? groupMembers.find((m) => m.user._id === userDetailsModal.memberId) ||
        group.members.find((m) => m.user._id === userDetailsModal.memberId)
    : null

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Group Invitation</h2>
              <p className="text-sm text-muted-foreground">You have been invited to join this group</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="space-y-6">
            {/* Group Info */}
            <div className="rounded-lg border border-border p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  {group.avatar ? (
                    <AvatarImage src={group.avatar} alt={group.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                    {group.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {group.memberCount} members
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="rounded-lg border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Group Members ({group.members.length})
                </h3>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isLoadingGetMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : group.members.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No members yet</p>
                ) : (
                  group.members.map((member) => (
                    <button
                      key={member.user._id}
                      onClick={() =>
                        setUserDetailsModal({
                          open: true,
                          memberId: member.user._id,
                          role: member.role,
                        })
                      }
                      className="w-full rounded-lg border border-border/50 p-3 hover:bg-accent transition-colors flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10">
                          {member.user.avatar ? (
                            <AvatarImage src={member.user.avatar} alt={member.user.name} />
                          ) : null}
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {member.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{member.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {member.status === "pending" && (
                          <Badge variant="outline" className="text-[10px]">
                            Pending
                          </Badge>
                        )}
                        {getRoleIcon(member.role) && (
                          <div className="text-muted-foreground" title={member.role}>
                            {getRoleIcon(member.role)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bottom-0 border-t border-border p-6 flex gap-3 bg-transparent">
              <Button
                className="flex-1 bg-transparent border border-gray-300 hover:bg-gray-100/10 text-white"
                onClick={handleRejectInvitation}
                disabled={isLoadingRespondInvitation}
              >
                {isLoadingRespondInvitation ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Decline
              </Button>
              <Button
                className="flex-1 bg-green-500/20 border border-green-300 text-green-600 hover:bg-green-500/30"
                onClick={handleAcceptInvitation}
                disabled={isLoadingRespondInvitation}
              >
                {isLoadingRespondInvitation ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Accept & Join
              </Button>
            </div>
          </div>
        </div>
      </div>

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
        onOpenChange={(open) => setUserDetailsModal({ ...userDetailsModal, open })}
      />
    </>
  )
}
