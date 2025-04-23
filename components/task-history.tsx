"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, BarChart3, RefreshCw } from "lucide-react"
import type { Task, CompletedSession } from "./pomodoro-app"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface TaskHistoryProps {
  sessions: CompletedSession[]
  tasks: Task[]
}

export function TaskHistory({ sessions, tasks }: TaskHistoryProps) {
  const [view, setView] = useState<"recent" | "stats">("recent")
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const { user } = useAuth()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Log sessions whenever they change
  useEffect(() => {
    console.log("TaskHistory received sessions:", sessions.length, sessions)
  }, [sessions])

  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySessions = sessions.filter((session) => {
    try {
      const sessionDate = new Date(session.completedAt)
      sessionDate.setHours(0, 0, 0, 0)
      return sessionDate.getTime() === today.getTime()
    } catch (error) {
      console.error("Error parsing session date:", error, session)
      return false
    }
  })

  // Calculate total focus time today
  const totalFocusTimeToday = todaySessions.reduce((total, session) => total + session.duration, 0)

  // Get recent sessions (last 10)
  const recentSessions = [...sessions]
    .sort((a, b) => {
      try {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      } catch (error) {
        console.error("Error sorting sessions:", error)
        return 0
      }
    })
    .slice(0, 10)

  // Calculate stats
  const totalSessions = sessions.length
  const totalFocusTime = sessions.reduce((total, session) => total + session.duration, 0)

  // Group sessions by task
  const sessionsByTask: Record<string, number> = {}
  sessions.forEach((session) => {
    if (sessionsByTask[session.taskId]) {
      sessionsByTask[session.taskId] += 1
    } else {
      sessionsByTask[session.taskId] = 1
    }
  })

  // Get top tasks
  const topTasks = Object.entries(sessionsByTask)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([taskId, count]) => {
      const task = tasks.find((t) => t._id === taskId)
      return {
        id: taskId,
        title: task?.title || "Unknown Task",
        count,
      }
    })

  const refreshSessions = async () => {
    setIsRefreshing(true)
    try {
      toast({
        title: "Sessions refreshed",
        description: `Found ${sessions.length} sessions.`,
      })
    } catch (error) {
      console.error("Error refreshing sessions:", error)
      toast({
        title: "Error refreshing sessions",
        description: "Failed to load your session history.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Today: {totalFocusTimeToday} min</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2",
              view === "recent" && "bg-muted",
              isDarkMode && "text-primary hover:text-primary/80",
            )}
            onClick={() => setView("recent")}
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2",
              view === "stats" && "bg-muted",
              isDarkMode && "text-primary hover:text-primary/80",
            )}
            onClick={() => setView("stats")}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground"
            onClick={refreshSessions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {view === "recent" ? (
        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                No completed sessions yet.
                <div className="mt-2 text-xs">Complete a Pomodoro timer to see your session history here.</div>
              </CardContent>
            </Card>
          ) : (
            recentSessions.map((session, index) => (
              <SessionItem key={session._id || index} session={session} isDarkMode={isDarkMode} />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={cn("text-muted-foreground", isDarkMode && "text-primary/70")}>Total Sessions</span>
                  <span className={cn("font-medium", isDarkMode ? "text-primary" : "text-tertiary")}>
                    {totalSessions}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={cn("text-muted-foreground", isDarkMode && "text-primary/70")}>Total Focus Time</span>
                  <span className={cn("font-medium", isDarkMode ? "text-primary" : "text-tertiary")}>
                    {totalFocusTime} min
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={cn("text-muted-foreground", isDarkMode && "text-primary/70")}>Daily Average</span>
                  <span className={cn("font-medium", isDarkMode ? "text-primary" : "text-tertiary")}>
                    {totalSessions > 0 ? Math.round(totalFocusTime / (totalSessions / Math.min(totalSessions, 4))) : 0}{" "}
                    min
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className={cn("text-sm font-medium", isDarkMode ? "text-primary" : "text-tertiary")}>Top Tasks</h4>
            {topTasks.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">No task data available.</CardContent>
              </Card>
            ) : (
              topTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <span className={cn("text-sm line-clamp-1", isDarkMode ? "text-primary" : "text-tertiary")}>
                        {task.title}
                      </span>
                      <span className={cn("text-sm font-medium", isDarkMode ? "text-primary" : "text-tertiary")}>
                        {task.count} sessions
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface SessionItemProps {
  session: CompletedSession
  isDarkMode: boolean
}

function SessionItem({ session, isDarkMode }: SessionItemProps) {
  let date, formattedDate, formattedTime

  try {
    date = new Date(session.completedAt)
    formattedDate = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
    formattedTime = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting session date:", error, session)
    formattedDate = "Unknown date"
    formattedTime = "Unknown time"
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className={cn("text-sm font-medium line-clamp-1", isDarkMode ? "text-primary" : "text-tertiary")}>
              {session.taskTitle || "Unnamed Task"}
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>{session.duration} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
