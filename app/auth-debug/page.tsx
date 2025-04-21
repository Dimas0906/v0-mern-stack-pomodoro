"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { authStorage, authCookies } from "@/lib/auth-utils"

export default function AuthDebugPage() {
  const { user, loading } = useAuth()
  const [localStorageUser, setLocalStorageUser] = useState<any>(null)
  const [hasCookie, setHasCookie] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    try {
      // Check localStorage
      const storedUser = authStorage.getUser()
      setLocalStorageUser(storedUser)

      // Check cookie
      setHasCookie(authCookies.exists())

      // Collect debug info
      setDebugInfo({
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      console.error("Error in auth debug:", e)
    }
  }, [])

  const refreshPage = () => {
    window.location.reload()
  }

  const goToHome = () => {
    window.location.href = "/"
  }

  const goToLogin = () => {
    window.location.href = "/login"
  }

  const clearStorage = () => {
    authStorage.removeUser()
    authCookies.remove()
    setLocalStorageUser(null)
    setHasCookie(false)
    window.location.reload()
  }

  const testLoginApi = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", password: "password" }),
      })

      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (e) {
      alert(`API Error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Auth Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Loading:</strong> {loading ? "Yes" : "No"}
              </p>
              <p>
                <strong>User in Context:</strong> {user ? "Yes" : "No"}
              </p>
              {user && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">LocalStorage User:</h3>
                {localStorageUser ? (
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(localStorageUser, null, 2)}
                  </pre>
                ) : (
                  <p className="text-red-500">No user in localStorage</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-1">Auth Cookie:</h3>
                {hasCookie ? (
                  <p className="text-green-500">Cookie exists</p>
                ) : (
                  <p className="text-red-500">No auth cookie found</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-1">Browser Info:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={refreshPage} variant="outline">
                Refresh Page
              </Button>
              <Button onClick={goToHome} variant="outline">
                Go to Home
              </Button>
              <Button onClick={goToLogin} variant="outline">
                Go to Login
              </Button>
              <Button onClick={clearStorage} variant="destructive">
                Clear Auth Data
              </Button>
              <Button onClick={testLoginApi} variant="outline">
                Test Login API
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
