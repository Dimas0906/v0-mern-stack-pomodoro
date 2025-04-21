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
        console.log("Checking for stored user...")
        const storedUser = localStorage.getItem("pomodoro-user")

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            console.log("Found stored user:", parsedUser.email)

            // Validate user object
            if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.email) {
              setUser(parsedUser)
            } else {
              console.error("Invalid user data in localStorage:", parsedUser)
              localStorage.removeItem("pomodoro-user")
            }
          } catch (e) {
            console.error("Error parsing user data:", e)
            localStorage.removeItem("pomodoro-user")
          }
        } else {
          console.log("No stored user found")
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error)
        localStorage.removeItem("pomodoro-user")
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    setTimeout(checkAuth, 100)
  }, [])

  const login = async (email: string, password: string) => {
    console.log(`Login attempt for: ${email}`)

    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    try {
      // Try to login with the API
      console.log("Sending login request to API...")
      const response = await AuthAPI.login({ email, password })
      console.log("Login API response:", response)

      if (response.success && response.user) {
        // Make sure we have a valid user object
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

        console.log("Setting user in state and localStorage:", userData)
        setUser(userData)

        // Make sure localStorage is updated synchronously
        try {
          localStorage.setItem("pomodoro-user", JSON.stringify(userData))
          console.log("User data saved to localStorage")
        } catch (e) {
          console.error("Error saving to localStorage:", e)
        }

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
      // Register with the API
      const result = await AuthAPI.register({ name, email, password })
      console.log("Registration API response:", result)

      if (!result || !result.id) {
        console.error("Invalid registration response:", result)
        return { success: false, error: "Registration failed - invalid response from server" }
      }

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
