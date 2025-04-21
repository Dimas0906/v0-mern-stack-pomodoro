"use client"

import { useEffect, useState } from "react"
import { PomodoroApp } from "@/components/pomodoro-app"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { DatabaseStatus } from "@/components/db-status"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [userChecked, setUserChecked] = useState(false)

  // Add a timeout to detect if loading takes too long
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
      }, 5000) // 5 seconds timeout

      return () => clearTimeout(timer)
    }
  }, [loading])

  // Check if user is logged in
  useEffect(() => {
    if (!loading) {
      setUserChecked(true)

      if (!user) {
        console.log("No user found, redirecting to login")
        window.location.href = "/login"
      } else {
        console.log("User found:", user.email)
      }
    }
  }, [user, loading, router])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    window.location.href = "/login"
  }

  const handleRetry = () => {
    // Force reload the page to retry authentication
    window.location.reload()
  }

  // Show loading state
  if (loading || !userChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary dark:bg-dark">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-tertiary dark:text-primary mx-auto mb-8" />
          <h2 className={cn("text-2xl font-semibold mb-2", isDarkMode ? "text-primary" : "text-tertiary")}>
            Loading...
          </h2>
          <p className={cn("mb-4", isDarkMode ? "text-primary/70" : "text-dark")}>Preparing your Pomodoro workspace</p>

          {loadingTimeout && (
            <div className="mt-8">
              <p className={cn("text-sm mb-4", isDarkMode ? "text-primary/70" : "text-dark")}>
                This is taking longer than expected. You can try:
              </p>
              <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // If no user and we've checked, the redirect should have happened
  if (!user) {
    return null
  }

  // User is authenticated, show the app
  return (
    <main className="min-h-screen bg-primary dark:bg-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className={cn("text-3xl font-bold", isDarkMode ? "text-primary" : "text-tertiary")}>
              Pomodoro Task Manager
            </h1>
            <DatabaseStatus />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className={cn("text-sm", isDarkMode ? "text-primary/70" : "text-tertiary/70")}>
              Welcome, {user.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={cn(
                isDarkMode
                  ? "border-primary text-primary hover:bg-primary hover:text-tertiary"
                  : "border-tertiary text-tertiary hover:bg-tertiary hover:text-primary",
              )}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        <PomodoroApp />
      </div>
    </main>
  )
}
