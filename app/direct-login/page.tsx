"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authStorage, authCookies } from "@/lib/auth-utils"

export default function DirectLoginPage() {
  const [email, setEmail] = useState("test@example.com")
  const [name, setName] = useState("Test User")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleDirectLogin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Create user data
      const userData = {
        id: `direct-${Date.now()}`,
        name,
        email,
      }

      // Save to localStorage
      authStorage.setUser(userData)

      // Set auth cookie
      authCookies.set(userData)

      setResult("Login data set successfully. Redirecting to home page...")

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBypassLogin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/auth/bypass-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "any-password" }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        // Save to localStorage
        authStorage.setUser(data.user)

        // Set auth cookie
        authCookies.set(data.user)

        setResult("Bypass login successful. Redirecting to home page...")

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/"
        }, 1500)
      } else {
        setResult(`API Error: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Direct Login (Bypass Authentication)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDirectLogin} disabled={isLoading} className="flex-1">
              {isLoading ? "Processing..." : "Direct Login"}
            </Button>

            <Button onClick={handleBypassLogin} disabled={isLoading} variant="outline" className="flex-1">
              {isLoading ? "Processing..." : "API Bypass"}
            </Button>
          </div>

          {result && (
            <div
              className={`p-3 rounded text-sm ${result.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
            >
              {result}
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>This page bypasses normal authentication for testing purposes.</p>
            <p>It directly sets the necessary auth data in localStorage and cookies.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
