"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, BarChart3 } from "lucide-react"
import type { Task, CompletedSession } from "./pomodoro-app"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface TaskHistoryProps {
  sessions: CompletedSession[]
  tasks: Task[]
}

export function TaskHistory({ sessions, tasks }: TaskHistoryProps) {
  const [view, setView] = useState<"recent" | "stats">("recent")
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySessions = sessions.filter((session) => {
    const sessionDate = new Date(session.completedAt)
    sessionDate.setHours(0, 0, 0, 0)
    return sessionDate.getTime() === today.getTime()
  })

  // Calculate total focus time today
  const totalFocusTimeToday = todaySessions.reduce((total, session) => total + session.duration, 0)

  // Get recent sessions (last 10)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
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
        </div>
      </div>

      {view === "recent" ? (
        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">No completed sessions yet.</CardContent>
            </Card>
          ) : (
            recentSessions.map((session) => <SessionItem key={session._id} session={session} isDarkMode={isDarkMode} />)
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
  const date = new Date(session.completedAt)
  const formattedDate = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className={cn("text-sm font-medium line-clamp-1", isDarkMode ? "text-primary" : "text-tertiary")}>
              {session.taskTitle}
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
