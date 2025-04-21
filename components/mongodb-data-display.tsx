"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function MongoDBDataDisplay() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [tasksRes, sessionsRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/sessions")])

      if (!tasksRes.ok || !sessionsRes.ok) {
        throw new Error("Failed to fetch data from MongoDB")
      }

      const tasks = await tasksRes.json()
      const sessions = await sessionsRes.json()

      setData({
        tasks: {
          count: tasks.length,
          completed: tasks.filter((t: any) => t.completed).length,
          incomplete: tasks.filter((t: any) => !t.completed).length,
          latest: tasks.length > 0 ? tasks[0] : null,
        },
        sessions: {
          count: sessions.length,
          totalMinutes: sessions.reduce((sum: number, s: any) => sum + s.duration, 0),
          latest: sessions.length > 0 ? sessions[0] : null,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>MongoDB Data</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="ml-2">{loading ? "Loading..." : "Refresh"}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">{error}</div>
        ) : !data ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Tasks</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span>{data.tasks.count}</span>
                <span className="text-muted-foreground">Completed:</span>
                <span>{data.tasks.completed}</span>
                <span className="text-muted-foreground">Incomplete:</span>
                <span>{data.tasks.incomplete}</span>
              </div>
              {data.tasks.latest && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">Latest Task:</p>
                  <p className="text-sm truncate">{data.tasks.latest.title}</p>
                </div>
              )}
            </div>

            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Sessions</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span>{data.sessions.count}</span>
                <span className="text-muted-foreground">Total Focus Time:</span>
                <span>{data.sessions.totalMinutes} minutes</span>
              </div>
              {data.sessions.latest && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">Latest Session:</p>
                  <p className="text-sm truncate">{data.sessions.latest.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(data.sessions.latest.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
