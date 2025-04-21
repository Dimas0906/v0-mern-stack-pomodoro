"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState("test@example.com")
  const [loginPassword, setLoginPassword] = useState("password")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()
  const { toast } = useToast()
  const { user, login, register } = useAuth()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to home")
      router.push("/")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    console.log("Attempting login with:", loginEmail)

    try {
      const result = await login(loginEmail, loginPassword)
      console.log("Login result:", result)

      if (!result.success) {
        console.error("Login failed:", result.error)
        setError(result.error || "Login failed")
        toast({
          title: "Login failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        })
      } else {
        console.log("Login successful, redirecting to home")
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        // Force navigation to home page
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred")
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    console.log("Attempting registration with:", registerEmail)

    try {
      const result = await register(registerName, registerEmail, registerPassword)
      console.log("Registration result:", result)

      if (!result.success) {
        console.error("Registration failed:", result.error)
        setError(result.error || "Registration failed")
        toast({
          title: "Registration failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        })
      } else {
        console.log("Registration successful")
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
        })

        // Clear the registration form
        setRegisterName("")
        setRegisterEmail("")
        setRegisterPassword("")

        // Set login form with registered email
        setLoginEmail(registerEmail)
        setLoginPassword("")

        // Switch to login tab
        setActiveTab("login")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("An unexpected error occurred")
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary dark:bg-dark p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border-secondary dark:border-tertiary">
        <CardHeader className="text-center bg-secondary dark:bg-tertiary rounded-t-lg">
          <CardTitle className={cn("text-2xl", isDarkMode ? "text-dark" : "text-tertiary")}>
            Pomodoro Task Manager
          </CardTitle>
          <CardDescription className={cn(isDarkMode ? "text-dark/70" : "text-dark")}>
            Sign in to access your tasks and sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className={cn(
                      "border-secondary focus:border-tertiary",
                      isDarkMode
                        ? "text-primary placeholder:text-primary/50"
                        : "text-tertiary placeholder:text-tertiary/50",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className={cn(
                      "border-secondary focus:border-tertiary",
                      isDarkMode
                        ? "text-primary placeholder:text-primary/50"
                        : "text-tertiary placeholder:text-tertiary/50",
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-tertiary hover:bg-secondary hover:text-tertiary text-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground mt-2">
                  <p>Demo account: test@example.com / password</p>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                    Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className={cn(
                      "border-secondary focus:border-tertiary",
                      isDarkMode
                        ? "text-primary placeholder:text-primary/50"
                        : "text-tertiary placeholder:text-tertiary/50",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className={cn(
                      "border-secondary focus:border-tertiary",
                      isDarkMode
                        ? "text-primary placeholder:text-primary/50"
                        : "text-tertiary placeholder:text-tertiary/50",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                    className={cn(
                      "border-secondary focus:border-tertiary",
                      isDarkMode
                        ? "text-primary placeholder:text-primary/50"
                        : "text-tertiary placeholder:text-tertiary/50",
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-tertiary hover:bg-secondary hover:text-tertiary text-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
