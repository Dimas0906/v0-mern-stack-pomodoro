"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function DataIntegrityCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{
    mongodb?: { tasks: number; sessions: number }
    localStorage?: { tasks: number; sessions: number }
    isConsistent?: boolean
    error?: string
  } | null>(null)
  const { user } = useAuth()

  const checkIntegrity = async () => {
    if (!user?.id) return

    setIsChecking(true)

    try {
      // Get MongoDB data counts
      const response = await fetch("/api/data-integrity")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data from MongoDB")
      }

      // Get localStorage data counts
      const localStoragePrefix = `pomodoro-${user.id}-`
      let localTaskCount = 0
      let localSessionCount = 0

      try {
        const localTasks = localStorage.getItem(`${localStoragePrefix}tasks`)
        if (localTasks) {
          localTaskCount = JSON.parse(localTasks).length
        }

        const localSessions = localStorage.getItem(`${localStoragePrefix}sessions`)
        if (localSessions) {
          localSessionCount = JSON.parse(localSessions).length
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error)
      }

      // Compare data
      setResult({
        mongodb: data.counts,
        localStorage: {
          tasks: localTaskCount,
          sessions: localSessionCount,
        },
        isConsistent: data.counts.tasks === localTaskCount && data.counts.sessions === localSessionCount,
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>MongoDB Data Integrity</span>
          <Button variant="outline" size="sm" onClick={checkIntegrity} disabled={isChecking}>
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">{isChecking ? "Checking..." : "Check"}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!result ? (
          <p className="text-muted-foreground text-center py-4">Click the button to check data integrity</p>
        ) : result.error ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{result.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.isConsistent ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <span className={result.isConsistent ? "text-green-500" : "text-amber-500"}>
                {result.isConsistent ? "Data is consistent" : "Data inconsistency detected"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">MongoDB</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks:</span>
                    <span>{result.mongodb?.tasks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions:</span>
                    <span>{result.mongodb?.sessions || 0}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">LocalStorage</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks:</span>
                    <span>{result.localStorage?.tasks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions:</span>
                    <span>{result.localStorage?.sessions || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
