"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { TodoList } from "@/components/todo-list"
import { TaskHistory } from "@/components/task-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { TaskAPI, SessionAPI } from "@/lib/api"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DataIntegrityCheck } from "@/components/data-integrity"

export type Task = {
  _id: string
  userId?: string
  title: string
  completed: boolean
  pomodoros: number
  description: string
  createdAt: Date | string
}

export type CompletedSession = {
  _id: string
  userId?: string
  taskId: string
  taskTitle: string
  duration: number
  completedAt: Date | string
}

export function PomodoroApp() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const { toast } = useToast()
  const [dataLoaded, setDataLoaded] = useState(false)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [syncResult, setSyncResult] = useState<{ success: boolean; attempted: boolean }>({
    success: false,
    attempted: false,
  })
  const [showDataIntegrityCheck, setShowDataIntegrityCheck] = useState(false)

  // Load data from API and localStorage on component mount
  useEffect(() => {
    if (!user?.id || dataLoaded) return

    console.log("PomodoroApp - Loading data for user:", user.id)
    const userId = user.id
    const localStoragePrefix = `pomodoro-${userId}-`

    const loadData = async () => {
      setIsLoading(true)
      try {
        // First try to load from API
        const [apiTasks, apiSessions] = await Promise.all([TaskAPI.getTasks(), SessionAPI.getSessions()])

        if (apiTasks && apiTasks.length > 0) {
          // API data exists, use it
          setTasks(apiTasks)
          console.log("Loaded tasks from API:", apiTasks.length)

          // Check if there's a current task saved
          const currentTaskId = localStorage.getItem(`${localStoragePrefix}current-task-id`)
          if (currentTaskId) {
            const task = apiTasks.find((t: Task) => t._id === currentTaskId)
            if (task) {
              setCurrentTask(task)
              console.log("Loaded current task:", task.title)
            }
          }

          // Save to localStorage for offline use
          localStorage.setItem(`${localStoragePrefix}tasks`, JSON.stringify(apiTasks))
        } else {
          // Try to load from localStorage as fallback
          const localTasks = localStorage.getItem(`${localStoragePrefix}tasks`)
          if (localTasks) {
            const parsedTasks = JSON.parse(localTasks)
            setTasks(parsedTasks)
            console.log("Loaded tasks from localStorage:", parsedTasks.length)

            // Check if there's a current task saved
            const currentTaskId = localStorage.getItem(`${localStoragePrefix}current-task-id`)
            if (currentTaskId) {
              const task = parsedTasks.find((t: Task) => t._id === currentTaskId)
              if (task) {
                setCurrentTask(task)
                console.log("Loaded current task:", task.title)
              }
            }

            // Try to sync with API
            try {
              for (const task of parsedTasks) {
                if (!task._id.includes("local-")) {
                  continue // Skip tasks that already have a server ID
                }

                // Create task on server
                const { title, description, completed, pomodoros } = task
                const newTask = await TaskAPI.createTask({ title, description })

                if (completed) {
                  await TaskAPI.updateTask(newTask._id, { completed })
                }

                if (pomodoros > 0) {
                  await TaskAPI.updateTask(newTask._id, { pomodoros })
                }
              }

              // Reload tasks from API after sync
              const syncedTasks = await TaskAPI.getTasks()
              setTasks(syncedTasks)
              localStorage.setItem(`${localStoragePrefix}tasks`, JSON.stringify(syncedTasks))
            } catch (syncError) {
              console.error("Error syncing local tasks to API:", syncError)
            }
          } else {
            // Initialize with empty arrays
            setTasks([])
            console.log("No tasks found, initializing with empty array")
          }
        }

        if (apiSessions && apiSessions.length > 0) {
          // API sessions exist, use them
          setCompletedSessions(apiSessions)
          console.log("Loaded sessions from API:", apiSessions.length)

          // Save to localStorage for offline use
          localStorage.setItem(`${localStoragePrefix}sessions`, JSON.stringify(apiSessions))
        } else {
          // Try to load from localStorage as fallback
          const localSessions = localStorage.getItem(`${localStoragePrefix}sessions`)
          if (localSessions) {
            const parsedSessions = JSON.parse(localSessions)
            setCompletedSessions(parsedSessions)
            console.log("Loaded sessions from localStorage:", parsedSessions.length)

            // Try to sync with API
            try {
              for (const session of parsedSessions) {
                if (!session._id.includes("local-")) {
                  continue // Skip sessions that already have a server ID
                }

                // Create session on server
                const { taskId, taskTitle, duration } = session
                await SessionAPI.createSession({ taskId, taskTitle, duration })
              }

              // Reload sessions from API after sync
              const syncedSessions = await SessionAPI.getSessions()
              setCompletedSessions(syncedSessions)
              localStorage.setItem(`${localStoragePrefix}sessions`, JSON.stringify(syncedSessions))
            } catch (syncError) {
              console.error("Error syncing local sessions to API:", syncError)
            }
          } else {
            // Initialize with empty array
            setCompletedSessions([])
            console.log("No sessions found, initializing with empty array")
          }
        }

        // Set last synced time
        const now = new Date()
        setLastSynced(now)
        localStorage.setItem(`${localStoragePrefix}last-synced`, now.toISOString())

        setDataLoaded(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)

        // Try to load from localStorage as fallback
        loadLocalData()
      }
    }

    const loadLocalData = () => {
      try {
        // Load tasks
        const localTasks = localStorage.getItem(`${localStoragePrefix}tasks`)
        if (localTasks) {
          const parsedTasks = JSON.parse(localTasks)
          setTasks(parsedTasks)
          console.log("Loaded tasks from localStorage:", parsedTasks.length)

          // Check if there's a current task saved
          const currentTaskId = localStorage.getItem(`${localStoragePrefix}current-task-id`)
          if (currentTaskId) {
            const task = parsedTasks.find((t: Task) => t._id === currentTaskId)
            if (task) {
              setCurrentTask(task)
              console.log("Loaded current task:", task.title)
            }
          }
        } else {
          // Initialize with empty array
          setTasks([])
          console.log("No tasks found in localStorage, initializing with empty array")
        }

        // Load sessions
        const localSessions = localStorage.getItem(`${localStoragePrefix}sessions`)
        if (localSessions) {
          const parsedSessions = JSON.parse(localSessions)
          setCompletedSessions(parsedSessions)
          console.log("Loaded sessions:", parsedSessions.length)
        } else {
          // Initialize with empty array
          setCompletedSessions([])
          console.log("No sessions found in localStorage, initializing with empty array")
        }

        // Load last synced time
        const lastSyncedTime = localStorage.getItem(`${localStoragePrefix}last-synced`)
        if (lastSyncedTime) {
          setLastSynced(new Date(lastSyncedTime))
        }

        setDataLoaded(true)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading local data:", error)
        // Initialize with empty arrays if local data fails
        setTasks([])
        setCompletedSessions([])
        setDataLoaded(true)
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, dataLoaded])

  // Save current task ID to localStorage when it changes
  useEffect(() => {
    if (!user?.id || !dataLoaded) return

    const userId = user.id
    const localStoragePrefix = `pomodoro-${userId}-`

    if (currentTask) {
      localStorage.setItem(`${localStoragePrefix}current-task-id`, currentTask._id)
    } else {
      localStorage.removeItem(`${localStoragePrefix}current-task-id`)
    }
  }, [currentTask, user, dataLoaded])

  // Save tasks to localStorage when they change
  useEffect(() => {
    if (!user?.id || !dataLoaded) return

    const userId = user.id
    const localStoragePrefix = `pomodoro-${userId}-`

    localStorage.setItem(`${localStoragePrefix}tasks`, JSON.stringify(tasks))
  }, [tasks, user, dataLoaded])

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (!user?.id || !dataLoaded) return

    const userId = user.id
    const localStoragePrefix = `pomodoro-${userId}-`

    localStorage.setItem(`${localStoragePrefix}sessions`, JSON.stringify(completedSessions))
  }, [completedSessions, user, dataLoaded])

  // Set up automatic syncing
  const syncWithServer = useCallback(async () => {
    if (!user?.id || !dataLoaded) return

    setIsSyncing(true)

    const userId = user.id
    const localStoragePrefix = `pomodoro-${userId}-`

    try {
      // Sync tasks with API
      for (const task of tasks) {
        if (task._id.includes("local-")) {
          // Create new task on server
          const { title, description, completed, pomodoros } = task
          const newTask = await TaskAPI.createTask({ title, description })

          if (completed) {
            await TaskAPI.updateTask(newTask._id, { completed })
          }

          if (pomodoros > 0) {
            await TaskAPI.updateTask(newTask._id, { pomodoros })
          }
        }
      }

      // Reload tasks from API after sync
      const syncedTasks = await TaskAPI.getTasks()
      setTasks(syncedTasks)
      localStorage.setItem(`${localStoragePrefix}tasks`, JSON.stringify(syncedTasks))

      // Sync sessions with API
      for (const session of completedSessions) {
        if (session._id.includes("local-")) {
          // Create new session on server
          const { taskId, taskTitle, duration } = session
          await SessionAPI.createSession({ taskId, taskTitle, duration })
        }
      }

      // Reload sessions from API after sync
      const syncedSessions = await SessionAPI.getSessions()
      setCompletedSessions(syncedSessions)
      localStorage.setItem(`${localStoragePrefix}sessions`, JSON.stringify(syncedSessions))

      // Update last synced time
      const now = new Date()
      setLastSynced(now)
      localStorage.setItem(`${localStoragePrefix}last-synced`, now.toISOString())

      // We'll handle the toast notification in a separate effect
      return true // Return success status
    } catch (error) {
      console.error("Error syncing with server:", error)
      // We'll handle the toast notification in a separate effect
      return false // Return failure status
    } finally {
      setIsSyncing(false)
    }
  }, [user, dataLoaded, tasks, completedSessions])

  // Add an effect to handle sync notifications
  useEffect(() => {
    if (syncResult.attempted) {
      if (syncResult.success) {
        toast({
          title: "Synced",
          description: "Your data has been synchronized with the database.",
        })
      } else {
        toast({
          title: "Sync failed",
          description: "Failed to sync data with the server. Will try again later.",
          variant: "destructive",
        })
      }
      // Reset the sync result
      setSyncResult({ success: false, attempted: false })
    }
  }, [syncResult, toast])

  // Modify the sync button click handler
  const handleSyncClick = async () => {
    const success = await syncWithServer()
    setSyncResult({ success, attempted: true })
  }

  // Set up automatic sync interval
  useEffect(() => {
    if (!user?.id || !dataLoaded) return

    // Sync every 5 minutes
    syncIntervalRef.current = setInterval(
      () => {
        console.log("Auto-syncing data...")
        syncWithServer()
      },
      5 * 60 * 1000,
    )

    // Sync once on load
    syncWithServer()

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [user, dataLoaded, syncWithServer])

  const addTask = async (task: Omit<Task, "_id" | "createdAt" | "userId">) => {
    try {
      // Create task on server
      const newTask = await TaskAPI.createTask({
        title: task.title,
        description: task.description || "",
      })

      // Update local state
      setTasks([...tasks, newTask])

      toast({
        title: "Task added",
        description: `"${task.title}" has been added to your tasks.`,
      })
    } catch (error) {
      console.error("Error adding task:", error)

      // Fallback to local storage if API fails
      const localTask = {
        _id: `local-${Date.now()}`,
        userId: user?.id,
        title: task.title,
        description: task.description || "",
        completed: false,
        pomodoros: 0,
        createdAt: new Date().toISOString(),
      }

      setTasks([...tasks, localTask])

      toast({
        title: "Task added locally",
        description: `"${task.title}" has been added to your tasks (offline mode).`,
      })
    }
  }

  const updateTask = async (updatedTask: Task) => {
    try {
      // If task has a local ID, we can't update it on the server yet
      if (updatedTask._id.includes("local-")) {
        // Just update local state
        setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))

        if (currentTask?._id === updatedTask._id) {
          setCurrentTask(updatedTask)
        }
        return
      }

      // Update task on server
      await TaskAPI.updateTask(updatedTask._id, {
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed,
        pomodoros: updatedTask.pomodoros,
      })

      // Update local state
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))

      if (currentTask?._id === updatedTask._id) {
        setCurrentTask(updatedTask)
      }
    } catch (error) {
      console.error("Error updating task:", error)

      // Update local state anyway
      setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)))

      if (currentTask?._id === updatedTask._id) {
        setCurrentTask(updatedTask)
      }

      toast({
        title: "Offline mode",
        description: "Task updated locally. Changes will sync when you're back online.",
        variant: "default",
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      // If task has a local ID, we can just remove it from local state
      if (taskId.includes("local-")) {
        setTasks(tasks.filter((task) => task._id !== taskId))

        if (currentTask?._id === taskId) {
          setCurrentTask(null)
        }

        toast({
          title: "Task deleted",
          description: "The task has been removed from your list.",
        })
        return
      }

      // Delete task on server
      await TaskAPI.deleteTask(taskId)

      // Update local state
      setTasks(tasks.filter((task) => task._id !== taskId))

      if (currentTask?._id === taskId) {
        setCurrentTask(null)
      }

      toast({
        title: "Task deleted",
        description: "The task has been removed from your list.",
      })
    } catch (error) {
      console.error("Error deleting task:", error)

      // Update local state anyway
      setTasks(tasks.filter((task) => task._id !== taskId))

      if (currentTask?._id === taskId) {
        setCurrentTask(null)
      }

      toast({
        title: "Offline mode",
        description: "Task deleted locally. Changes will sync when you're back online.",
        variant: "default",
      })
    }
  }

  const completeTask = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId)
    if (!task) {
      console.warn(`Task with ID ${taskId} not found for completion`)
      return
    }

    console.log(`Completing task: ${task.title} (${taskId})`)
    const updatedTask = { ...task, completed: true }

    try {
      // If task has a local ID, we can't update it on the server yet
      if (taskId.includes("local-")) {
        console.log("Completing local task")
        // Just update local state
        setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)))

        if (currentTask?._id === taskId) {
          setCurrentTask(null)
        }

        toast({
          title: "Task completed",
          description: "Great job! The task has been marked as complete.",
        })
        return
      }

      // Update task on server
      console.log("Sending task completion to server")
      await TaskAPI.updateTask(taskId, { completed: true })

      // Update local state
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)))

      if (currentTask?._id === taskId) {
        setCurrentTask(null)
      }

      toast({
        title: "Task completed",
        description: "Great job! The task has been marked as complete.",
      })
    } catch (error) {
      console.error("Error completing task:", error)

      // Update local state anyway
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)))

      if (currentTask?._id === taskId) {
        setCurrentTask(null)
      }

      toast({
        title: "Offline mode",
        description: "Task marked as complete locally. Changes will sync when you're back online.",
        variant: "default",
      })
    }
  }

  const selectTaskForPomodoro = (task: Task) => {
    setCurrentTask(task)

    toast({
      title: "Task selected",
      description: `"${task.title}" is now your active Pomodoro task.`,
    })
  }

  const completePomodoro = async (duration: number) => {
    if (currentTask) {
      try {
        console.log(`Creating session for task: ${currentTask.title}, duration: ${duration}`)

        // Create new session on server
        const newSession = await SessionAPI.createSession({
          taskId: currentTask._id,
          taskTitle: currentTask.title,
          duration,
        })

        console.log("Session created successfully:", newSession)

        // Update local state with the session from the server
        setCompletedSessions([...completedSessions, newSession])

        // The server should have incremented the pomodoro count, so we need to fetch the updated task
        let updatedTask

        if (!currentTask._id.includes("local-")) {
          try {
            updatedTask = await TaskAPI.getTask(currentTask._id)
          } catch (error) {
            console.error("Error fetching updated task:", error)
            // Fallback to incrementing locally
            updatedTask = {
              ...currentTask,
              pomodoros: currentTask.pomodoros + 1,
            }
          }
        } else {
          // For local tasks, increment locally
          updatedTask = {
            ...currentTask,
            pomodoros: currentTask.pomodoros + 1,
          }
        }

        // Update tasks array
        setTasks(tasks.map((task) => (task._id === currentTask._id ? updatedTask : task)))

        // Update current task reference
        setCurrentTask(updatedTask)

        toast({
          title: "Pomodoro completed!",
          description: `You've completed a ${duration} minute focus session.`,
        })
      } catch (error) {
        console.error("Error completing pomodoro:", error)

        // Fallback to local storage if API fails
        const newSession = {
          _id: `local-${Date.now()}`,
          userId: user?.id,
          taskId: currentTask._id,
          taskTitle: currentTask.title,
          duration,
          completedAt: new Date().toISOString(),
        }

        console.log("Created local session:", newSession)

        // Update local state
        setCompletedSessions([...completedSessions, newSession])

        // Update task pomodoro count
        const updatedTask = {
          ...currentTask,
          pomodoros: currentTask.pomodoros + 1,
        }

        // Update tasks array
        setTasks(tasks.map((task) => (task._id === currentTask._id ? updatedTask : task)))

        // Update current task reference
        setCurrentTask(updatedTask)

        toast({
          title: "Pomodoro completed! (Offline mode)",
          description: `You've completed a ${duration} minute focus session. Data will sync when you're back online.`,
        })
      }
    } else {
      console.warn("No current task selected when completing pomodoro")
      toast({
        title: "Session completed",
        description: `You've completed a ${duration} minute focus session, but no task was selected.`,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-4 border-secondary">
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="timer" className="data-[state=active]:bg-primary data-[state=active]:text-tertiary">
              Pomodoro Timer
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-tertiary">
              Task List
            </TabsTrigger>
          </TabsList>
          <TabsContent value="timer" className="mt-4">
            <PomodoroTimer currentTask={currentTask} onComplete={completePomodoro} />
          </TabsContent>
          <TabsContent value="tasks" className="mt-4">
            <TodoList
              tasks={tasks}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onCompleteTask={completeTask}
              onSelectTask={selectTaskForPomodoro}
              currentTaskId={currentTask?._id}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-4 border-secondary">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-tertiary">Session History</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDataIntegrityCheck(true)}
              className="flex items-center gap-1 border-secondary hover:bg-secondary hover:text-tertiary"
            >
              <Database className="h-3.5 w-3.5" />
              Check Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="flex items-center gap-1 border-secondary hover:bg-secondary hover:text-tertiary"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/session-debug", "_blank")}
              className="flex items-center gap-1 border-secondary hover:bg-secondary hover:text-tertiary"
            >
              <span className="text-xs">🐞</span>
              <span className="ml-1">Debug</span>
            </Button>
          </div>
        </div>
        {lastSynced && <p className="text-xs text-muted-foreground mb-4">Last synced: {lastSynced.toLocaleString()}</p>}
        <TaskHistory sessions={completedSessions} tasks={tasks} />
      </Card>

      <Dialog open={showDataIntegrityCheck} onOpenChange={setShowDataIntegrityCheck}>
        <DialogContent className="sm:max-w-md">
          <DataIntegrityCheck onClose={() => setShowDataIntegrityCheck(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
