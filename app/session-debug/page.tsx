"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { SessionAPI } from "@/lib/api"
import { debugSessionData } from "@/lib/session-debug"
import { Loader2, RefreshCw } from "lucide-react"

export default function SessionDebugPage() {
  const { user, loading } = useAuth()
  const [apiSessions, setApiSessions] = useState<any[]>([])
  const [localSessions, setLocalSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login"
    }
  }, [user, loading])

  const loadData = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      // Get sessions from API
      const sessions = await SessionAPI.getSessions()
      setApiSessions(sessions)

      // Get sessions from localStorage
      const debug = debugSessionData(user.id)
      setLocalSessions(debug.sessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const createTestSession = async () => {
    if (!user?.id) return

    try {
      // Create a test session
      const testSession = {
        taskId: "test-task-id",
        taskTitle: "Test Session",
        duration: 25,
      }

      const result = await SessionAPI.createSession(testSession)
      alert(`Test session created: ${JSON.stringify(result)}`)

      // Reload data
      loadData()
    } catch (err) {
      alert(`Error creating test session: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Session Debug</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="outline" onClick={createTestSession} disabled={isLoading}>
            Create Test Session
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Sessions ({apiSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {apiSessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions found in API</p>
            ) : (
              <div className="space-y-2">
                {apiSessions.map((session, index) => (
                  <div key={session._id || index} className="border p-3 rounded-md text-sm">
                    <div>
                      <strong>ID:</strong> {session._id}
                    </div>
                    <div>
                      <strong>Task:</strong> {session.taskTitle}
                    </div>
                    <div>
                      <strong>Duration:</strong> {session.duration} min
                    </div>
                    <div>
                      <strong>Completed:</strong> {new Date(session.completedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Sessions ({localSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {localSessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions found in localStorage</p>
            ) : (
              <div className="space-y-2">
                {localSessions.map((session, index) => (
                  <div key={session._id || index} className="border p-3 rounded-md text-sm">
                    <div>
                      <strong>ID:</strong> {session._id}
                    </div>
                    <div>
                      <strong>Task:</strong> {session.taskTitle}
                    </div>
                    <div>
                      <strong>Duration:</strong> {session.duration} min
                    </div>
                    <div>
                      <strong>Completed:</strong> {new Date(session.completedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
