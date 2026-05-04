"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store/store"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { searchUserThunk, clearSearch } from "@/lib/store/slices/user-slice"
import { BackgroundGradient } from "@/components/chat/chat-background"

export default function FindUsersPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { searchResults, isSearching, searchError } = useSelector((state: RootState) => state.user)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"email" | "username">("username")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (searchQuery.length === 0) {
      dispatch(clearSearch())
      setHasSearched(false)
      return
    }

    if (searchQuery.length > 2) {
      setHasSearched(true)
      dispatch(searchUserThunk({ query: searchQuery, type: searchType }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSearchTypeChange = () => {
    setSearchQuery("")
    setSearchType(searchType === "email" ? "username" : "email")
    dispatch(clearSearch())
    setHasSearched(false)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    dispatch(clearSearch())
    setHasSearched(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/5 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Find Users</span>
        </div>
        <ThemeToggle />
      </header>
      <BackgroundGradient />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Search Controls */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-3">
          {/* Search Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={searchType === "username" ? "default" : "outline"}
              onClick={handleSearchTypeChange}
              className={`flex-1 ${searchType === "username" ? "bg-black dark:bg-white" : ""}`}
            >
              Search by Username
            </Button>
            <Button
              variant={searchType === "email" ? "default" : "outline"}
              onClick={handleSearchTypeChange}
              className={`flex-1 ${searchType === "email" ? "bg-black dark:bg-white" : ""}`}
            >
              Search by Email
            </Button>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchType === "email" ? "Enter email address..." : "Enter username..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={searchQuery.length <= 2} className="px-6 bg-black dark:bg-white" variant="default">
              Search
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-2">
          {!hasSearched ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Enter a {searchType} to search for users</p>
            </motion.div>
          ) : isSearching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="inline-block">
                <div className="h-8 w-8 border-4 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              </div>
              <p className="text-muted-foreground mt-4">Searching...</p>
            </motion.div>
          ) : searchError ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-muted-foreground">{searchError}</p>
            </motion.div>
          ) : searchResults?.length === 0 || !searchResults ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-muted-foreground">No user found with this {searchType}</p>
            </motion.div>
          ) : (
            (Array.isArray(searchResults) ? searchResults : [searchResults]).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <Link href={`/user/${user.username}`} className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      {user.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon" asChild>
                    <Link href={`/chat?user=${user.username}`}>
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
