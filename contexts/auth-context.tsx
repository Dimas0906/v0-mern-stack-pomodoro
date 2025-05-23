"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authCookies, authStorage } from "@/lib/auth-utils"

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
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for stored user on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log("Checking for stored user...")
        const storedUser = authStorage.getUser()

        if (storedUser) {
          console.log("Found stored user:", storedUser.email)
          setUser(storedUser)
        } else {
          console.log("No stored user found")
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error)
        authStorage.removeUser()
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    setTimeout(checkAuth, 100)
  }, [])

  const checkAuth = (): boolean => {
    const storedUser = authStorage.getUser()
    const hasCookie = authCookies.exists()
    return !!storedUser && hasCookie
  }

  const login = async (email: string, password: string) => {
    console.log(`Login attempt for: ${email}`)

    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    try {
      // For demo purposes, we'll just use a hardcoded user
      if (email === "test@example.com" && password === "password") {
        const userData = {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
        }

        console.log("Setting user in state and localStorage:", userData)
        setUser(userData)

        // Save to localStorage and set cookie
        authStorage.setUser(userData)
        authCookies.set(userData)

        return { success: true }
      }

      return { success: false, error: "Invalid email or password" }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    console.log(`Registration attempt for: ${email}`)

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    try {
      // For demo purposes, we'll just pretend to register
      console.log("Registration successful for:", email)
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  const logout = () => {
    console.log("Logging out user")
    setUser(null)
    authStorage.removeUser()
    authCookies.remove()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
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
