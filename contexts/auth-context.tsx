"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { AuthAPI } from "@/lib/api"
import { logAuthEvent, checkLocalStorage, debugAuthState } from "@/lib/debug-utils"

type User = {
  id: string
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  debugAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for stored user on mount
  useEffect(() => {
    const checkAuth = () => {
      logAuthEvent("Checking authentication state")

      // Check if localStorage is available
      if (!checkLocalStorage()) {
        setLoading(false)
        return
      }

      try {
        const storedUser = localStorage.getItem("pomodoro-user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)

          // Validate user object
          if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.email) {
            logAuthEvent("User found in localStorage", { id: parsedUser.id, email: parsedUser.email })
            setUser(parsedUser)
          } else {
            logAuthEvent("Invalid user object in localStorage", parsedUser)
            localStorage.removeItem("pomodoro-user")
          }
        } else {
          logAuthEvent("No user found in localStorage")
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error)
        // Clear potentially corrupted data
        localStorage.removeItem("pomodoro-user")
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    setTimeout(checkAuth, 100)
  }, []) // Empty dependency array to run only once on mount

  const login = async (email: string, password: string) => {
    logAuthEvent("Login attempt", { email })

    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    try {
      // Try to login with the API
      const response = await AuthAPI.login({ email, password })
      logAuthEvent("Login API response", { success: response.success, hasUser: !!response.user })

      if (response.success && response.user) {
        // Make sure we have a valid user object with all required fields
        if (!response.user.id || !response.user.name || !response.user.email) {
          console.error("Invalid user object received:", response.user)
          return { success: false, error: "Invalid user data received from server" }
        }

        // Store user in state and localStorage
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
        }

        setUser(userData)
        localStorage.setItem("pomodoro-user", JSON.stringify(userData))
        logAuthEvent("User stored in state and localStorage", { id: userData.id })
        return { success: true }
      }

      return { success: false, error: "Invalid email or password" }
    } catch (error) {
      logAuthEvent("Login error", { error: error instanceof Error ? error.message : "Unknown error" })
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    logAuthEvent("Registration attempt", { name, email })

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    try {
      // Register with the API
      const user = await AuthAPI.register({ name, email, password })

      // Validate the response
      if (!user || !user.id) {
        logAuthEvent("Registration failed - invalid response from server")
        return { success: false, error: "Registration failed - invalid response from server" }
      }

      logAuthEvent("Registration successful", { id: user.id })
      return { success: true }
    } catch (error) {
      logAuthEvent("Registration error", { error: error instanceof Error ? error.message : "Unknown error" })
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  const logout = () => {
    logAuthEvent("Logout")
    setUser(null)
    localStorage.removeItem("pomodoro-user")
  }

  const debugAuth = () => {
    debugAuthState()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, debugAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
