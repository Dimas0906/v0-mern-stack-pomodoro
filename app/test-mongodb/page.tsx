"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestMongoDBPage() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "success" | "error" | null>(null)
  const [connectionMessage, setConnectionMessage] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userCheckResult, setUserCheckResult] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Test MongoDB connection on page load
  useEffect(() => {
    async function testConnection() {
      setConnectionStatus("loading")
      try {
        const response = await fetch("/api/test-mongodb")
        const data = await response.json()

        if (data.status === "success") {
          setConnectionStatus("success")
          setConnectionMessage(`Connected to MongoDB. Found ${data.userCount} users.`)
        } else {
          setConnectionStatus("error")
          setConnectionMessage(`Connection failed: ${data.message}`)
        }
      } catch (error) {
        setConnectionStatus("error")
        setConnectionMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    testConnection()
  }, [])

  const checkUser = async () => {
    if (!email) return

    setIsLoading(true)
    setUserCheckResult(null)

    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setUserCheckResult(data)
    } catch (error) {
      setUserCheckResult({
        error: true,
        message: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testLogin = async () => {
    if (!email || !password) return

    setIsLoading(true)
    setLoginResult(null)

    try {
      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      setLoginResult(data)
    } catch (error) {
      setLoginResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>MongoDB Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          {connectionStatus === "loading" && (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Testing connection...</span>
            </div>
          )}

          {connectionStatus === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <AlertDescription>{connectionMessage}</AlertDescription>
            </Alert>
          )}

          {connectionStatus === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5 mr-2" />
              <AlertDescription>{connectionMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Check User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={checkUser} disabled={isLoading || !email}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Check
              </Button>
            </div>

            {userCheckResult && (
              <Alert
                className={userCheckResult.exists ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}
              >
                {userCheckResult.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                )}
                <AlertDescription>
                  {userCheckResult.exists
                    ? `User found: ${userCheckResult.user.name} (${userCheckResult.user.email})`
                    : "User not found"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" onClick={testLogin} disabled={isLoading || !email || !password}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Login
            </Button>

            {loginResult && (
              <Alert className={loginResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {loginResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <AlertDescription>
                  {loginResult.message}
                  {loginResult.success && loginResult.user && (
                    <div className="mt-2">
                      <p>
                        <strong>User:</strong> {loginResult.user.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {loginResult.user.email}
                      </p>
                      <p>
                        <strong>ID:</strong> {loginResult.user.id}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
