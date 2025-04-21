"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export function AuthDebug() {
  const { user } = useAuth()
  const [localStorageUser, setLocalStorageUser] = useState<any>(null)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("pomodoro-user")
      if (storedUser) {
        setLocalStorageUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e)
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
    localStorage.removeItem("pomodoro-user")
    setLocalStorageUser(null)
    window.location.reload()
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Auth Context User:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : "No user in context"}
          </pre>
        </div>

        <div>
          <h3 className="font-medium mb-1">LocalStorage User:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {localStorageUser ? JSON.stringify(localStorageUser, null, 2) : "No user in localStorage"}
          </pre>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={refreshPage} variant="outline" size="sm">
            Refresh Page
          </Button>
          <Button onClick={goToHome} variant="outline" size="sm">
            Go to Home
          </Button>
          <Button onClick={goToLogin} variant="outline" size="sm">
            Go to Login
          </Button>
          <Button onClick={clearStorage} variant="destructive" size="sm">
            Clear Storage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
