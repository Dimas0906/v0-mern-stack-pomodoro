"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export function DataVisualization() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      try {
        const [tasksRes, sessionsRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/sessions")])

        if (!tasksRes.ok || !sessionsRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const tasks = await tasksRes.json()
        const sessions = await sessionsRes.json()

        // Process data for visualization
        const taskCompletionData = {
          completed: tasks.filter((t: any) => t.completed).length,
          incomplete: tasks.filter((t: any) => !t.completed).length,
        }

        // Group sessions by day
        const sessionsByDay = sessions.reduce((acc: any, session: any) => {
          const date = new Date(session.completedAt).toLocaleDateString()
          if (!acc[date]) {
            acc[date] = []
          }
          acc[date].push(session)
          return acc
        }, {})

        // Calculate total focus time by day
        const focusTimeByDay = Object.entries(sessionsByDay).map(([date, daySessions]: [string, any]) => ({
          date,
          totalMinutes: daySessions.reduce((sum: number, session: any) => sum + session.duration, 0),
        }))

        setData({
          taskCompletionData,
          focusTimeByDay: focusTimeByDay
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-7), // Last 7 days
        })
      } catch (error) {
        console.error("Error fetching data for visualization:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse h-40 bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">No data available for visualization</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Visualization</CardTitle>
        <CardDescription>Visual representation of your MongoDB data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Task Completion</h3>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              {data.taskCompletionData.completed + data.taskCompletionData.incomplete > 0 ? (
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${
                      (data.taskCompletionData.completed /
                        (data.taskCompletionData.completed + data.taskCompletionData.incomplete)) *
                      100
                    }%`,
                  }}
                ></div>
              ) : (
                <div className="h-full bg-muted"></div>
              )}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>Completed: {data.taskCompletionData.completed}</span>
              <span>Incomplete: {data.taskCompletionData.incomplete}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Focus Time (Last 7 Days)</h3>
            <div className="flex items-end h-40 gap-1">
              {data.focusTimeByDay.map((day: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm"
                    style={{
                      height: `${Math.min(100, (day.totalMinutes / 120) * 100)}%`,
                    }}
                  ></div>
                  <span className="text-xs mt-1 truncate w-full text-center">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                </div>
              ))}
              {data.focusTimeByDay.length === 0 && (
                <div className="w-full text-center text-muted-foreground py-10">No focus time data available</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
