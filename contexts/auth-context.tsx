"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { AuthAPI } from "@/lib/api"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for stored user on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("pomodoro-user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, []) // Empty dependency array to run only once on mount

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    try {
      // Try to login with the API
      const response = await AuthAPI.login({ email, password })

      if (response.success && response.user) {
        setUser(response.user)
        localStorage.setItem("pomodoro-user", JSON.stringify(response.user))
        return { success: true }
      }

      return { success: false, error: "Invalid email or password" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    try {
      // Register with the API
      await AuthAPI.register({ name, email, password })
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pomodoro-user")
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
