"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Pause, Play, RotateCcw, CheckCircle2, Save, ChevronDown, ChevronUp, Check } from "lucide-react"
import type { Task } from "./pomodoro-app"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"

// Mock redis for client-side execution
const redis = {
  get: async (key: string) => {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  },
  set: async (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
}

interface PomodoroTimerProps {
  currentTask: Task | null
  onComplete: (duration: number) => void
}

export function PomodoroTimer({ currentTask, onComplete }: PomodoroTimerProps) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  // Timer settings
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4)
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false)
  const [isSettingsLoading, setIsSettingsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Timer state
  const [timeLeft, setTimeLeft] = useState(workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [isLongBreak, setIsLongBreak] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [notes, setNotes] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Refs for timer state persistence
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      setIsSettingsLoading(true)

      try {
        // Get user-specific settings key
        const settingsKey = user?.id ? `pomodoro-settings-${user.id}` : "pomodoro-settings-default"

        // Try to load from localStorage
        const cachedSettings = localStorage.getItem(settingsKey)

        if (cachedSettings) {
          const settings = JSON.parse(cachedSettings)
          setWorkDuration(settings.workDuration || 25)
          setBreakDuration(settings.breakDuration || 5)
          setLongBreakDuration(settings.longBreakDuration || 15)
          setSessionsBeforeLongBreak(settings.sessionsBeforeLongBreak || 4)
          setAutoStartBreaks(settings.autoStartBreaks || false)
          setAutoStartPomodoros(settings.autoStartPomodoros || false)
        } else {
          // Use default settings if none found
          const defaultSettings = {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLongBreak: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
          }

          // Save default settings to localStorage
          localStorage.setItem(settingsKey, JSON.stringify(defaultSettings))
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        setError(error instanceof Error ? error : new Error("Failed to load settings"))
        // Don't call toast here during render
      } finally {
        setIsSettingsLoading(false)
      }
    }

    loadSettings()

    // Load timer state from localStorage
    const loadTimerState = async () => {
      if (!user?.id) return

      try {
        // Try to load from database first
        const dbTimerState = await redis.get(`timer-state-${user.id}`)

        if (dbTimerState) {
          console.log("Loaded timer state from database")
          setTimeLeft(dbTimerState.timeLeft)
          setIsBreak(dbTimerState.isBreak)
          setIsLongBreak(dbTimerState.isLongBreak)
          setSessionCount(dbTimerState.sessionCount)
          // Don't auto-resume the timer, just restore the state
          setIsRunning(false)

          // Also update localStorage
          const timerStateKey = `pomodoro-timer-state-${user.id}`
          localStorage.setItem(timerStateKey, JSON.stringify(dbTimerState))
          return
        }

        // Fall back to localStorage if database doesn't have the data
        const timerStateKey = `pomodoro-timer-state-${user.id}`
        const timerState = localStorage.getItem(timerStateKey)

        if (timerState) {
          try {
            const state = JSON.parse(timerState)
            setTimeLeft(state.timeLeft)
            setIsBreak(state.isBreak)
            setIsLongBreak(state.isLongBreak)
            setSessionCount(state.sessionCount)
            // Don't auto-resume the timer, just restore the state
            setIsRunning(false)

            // Save to database for future use
            await redis.set(`timer-state-${user.id}`, state)
          } catch (error) {
            console.error("Error parsing timer state:", error)
          }
        }
      } catch (error) {
        console.error("Error loading timer state:", error)

        // Fall back to localStorage if database access fails
        const timerStateKey = `pomodoro-timer-state-${user.id}`
        const timerState = localStorage.getItem(timerStateKey)

        if (timerState) {
          try {
            const state = JSON.parse(timerState)
            setTimeLeft(state.timeLeft)
            setIsBreak(state.isBreak)
            setIsLongBreak(state.isLongBreak)
            setSessionCount(state.sessionCount)
            setIsRunning(false)
          } catch (error) {
            console.error("Error parsing timer state:", error)
          }
        }
      }
    }

    loadTimerState().catch((error) => {
      console.error("Failed to load timer state:", error)
    })
  }, [toast, user])

  // Add this useEffect after the loadSettings useEffect
  useEffect(() => {
    if (!isSettingsLoading && error) {
      toast({
        title: "Error",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive",
      })
    }
  }, [isSettingsLoading, toast, error])

  const saveTimerStateToDatabase = useCallback(async () => {
    if (!user?.id) return

    try {
      const timerState = {
        timeLeft,
        isBreak,
        isLongBreak,
        sessionCount,
      }

      await redis.set(`timer-state-${user.id}`, timerState)
      console.log("Timer state saved to database")
    } catch (error) {
      console.error("Error saving timer state to database:", error)
    }
  }, [user, timeLeft, isBreak, isLongBreak, sessionCount])

  // Save settings to localStorage
  const saveSettings = () => {
    setIsSavingSettings(true)

    try {
      // Get user-specific settings key
      const settingsKey = user?.id ? `pomodoro-settings-${user.id}` : "pomodoro-settings-default"

      // Save to localStorage
      const settings = {
        workDuration,
        breakDuration,
        longBreakDuration,
        sessionsBeforeLongBreak,
        autoStartBreaks,
        autoStartPomodoros,
      }

      localStorage.setItem(settingsKey, JSON.stringify(settings))

      // Show success message
      setSaveSuccess(true)

      // Close settings panel after a delay
      setTimeout(() => {
        setShowSettings(false)
        setSaveSuccess(false)
      }, 1500)

      toast({
        title: "Settings saved",
        description: "Your timer settings have been saved.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timerStateKey = user?.id ? `pomodoro-timer-state-${user.id}` : "pomodoro-timer-state-default"

    const timerState = {
      timeLeft,
      isBreak,
      isLongBreak,
      sessionCount,
    }
    localStorage.setItem(timerStateKey, JSON.stringify(timerState))
  }, [timeLeft, isBreak, isLongBreak, sessionCount, user])

  // Save timer state to database when it changes
  useEffect(() => {
    if (!user?.id) return

    const saveTimeout = setTimeout(() => {
      saveTimerStateToDatabase()
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(saveTimeout)
  }, [timeLeft, isBreak, isLongBreak, sessionCount, user, saveTimerStateToDatabase])

  // Initialize timer when settings change, but ONLY if not running
  useEffect(() => {
    if (!isRunning) {
      // Only reset the timer if it's not already running
      // AND if the timeLeft is 0 (initial state) or if we're switching between work/break modes
      if (
        timeLeft === 0 ||
        (isBreak && timeLeft === workDuration * 60) ||
        (!isBreak && timeLeft === (isLongBreak ? longBreakDuration : breakDuration) * 60)
      ) {
        if (isBreak) {
          setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60)
        } else {
          setTimeLeft(workDuration * 60)
        }
      }
    }
  }, [workDuration, breakDuration, longBreakDuration, isBreak, isLongBreak, isRunning, timeLeft])

  // Load notes from current task
  useEffect(() => {
    if (currentTask) {
      setNotes(currentTask.description)
    } else {
      setNotes("")
    }
  }, [currentTask])

  // Add a separate effect for timer completion notifications
  const [timerCompleted, setTimerCompleted] = useState(false)
  const [isWorkCompleted, setIsWorkCompleted] = useState(false)
  const [isBreakCompleted, setIsBreakCompleted] = useState(false)

  useEffect(() => {
    // Check if timer just completed
    if (
      timeLeft === 0 ||
      (timeLeft === (isBreak ? (isLongBreak ? longBreakDuration : breakDuration) : workDuration) * 60 && timerCompleted)
    ) {
      if (timerCompleted) {
        if (isWorkCompleted) {
          toast({
            title: "Work session completed!",
            description: `Time for a ${isLongBreak ? "long " : ""}break.`,
          })
          setIsWorkCompleted(false)
        } else if (isBreakCompleted) {
          toast({
            title: "Break completed!",
            description: "Ready for the next Pomodoro?",
          })
          setIsBreakCompleted(false)
        }
        setTimerCompleted(false)
      }
    }
  }, [
    timeLeft,
    timerCompleted,
    isWorkCompleted,
    isBreakCompleted,
    isBreak,
    isLongBreak,
    breakDuration,
    longBreakDuration,
    workDuration,
    toast,
  ])

  // Update the timer effect to set the completion flags
  useEffect(() => {
    const prevTimeLeft = timeLeft

    if (prevTimeLeft === 1) {
      setTimerCompleted(true)
      if (!isBreak) {
        setIsWorkCompleted(true)
      } else {
        setIsBreakCompleted(true)
      }
    }
  }, [timeLeft, isBreak])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout)

            // Timer completed
            if (!isBreak) {
              // Work session completed
              const newSessionCount = sessionCount + 1
              setSessionCount(newSessionCount)

              // Call onComplete with the current duration
              console.log("Timer completed, calling onComplete with duration:", workDuration)
              onComplete(workDuration)

              // Determine if next break should be a long break
              const shouldBeLongBreak = newSessionCount % sessionsBeforeLongBreak === 0
              setIsLongBreak(shouldBeLongBreak)
              setIsBreak(true)

              // Set time for the break
              const nextDuration = shouldBeLongBreak ? longBreakDuration : breakDuration

              // Auto-start break if enabled
              setIsRunning(autoStartBreaks)

              return nextDuration * 60
            } else {
              // Break completed
              setIsBreak(false)
              setIsRunning(autoStartPomodoros)

              return workDuration * 60
            }
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [
    isRunning,
    isBreak,
    isLongBreak,
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionCount,
    sessionsBeforeLongBreak,
    autoStartBreaks,
    autoStartPomodoros,
    onComplete,
  ])

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
    // We don't reset the timeLeft here, so it will continue from where it was paused
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (isBreak) {
      setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60)
    } else {
      setTimeLeft(workDuration * 60)
    }
  }

  const skipToNextPhase = () => {
    setIsRunning(false)

    if (!isBreak) {
      // Skip to break - this means we're completing a work session
      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)

      // Call onComplete to record the session
      console.log("Skipping to break, calling onComplete with duration:", workDuration)
      onComplete(workDuration)

      // Determine if next break should be a long break
      const shouldBeLongBreak = newSessionCount % sessionsBeforeLongBreak === 0
      setIsLongBreak(shouldBeLongBreak)
      setIsBreak(true)

      // Set time for the break
      setTimeLeft((shouldBeLongBreak ? longBreakDuration : breakDuration) * 60)
    } else {
      // Skip to work
      setIsBreak(false)
      setTimeLeft(workDuration * 60)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = isBreak
    ? 1 - timeLeft / ((isLongBreak ? longBreakDuration : breakDuration) * 60)
    : 1 - timeLeft / (workDuration * 60)

  if (isSettingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tertiary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-4",
          isBreak
            ? isLongBreak
              ? "border-emerald-500 dark:border-emerald-700"
              : "border-sky-500 dark:border-sky-700"
            : "border-tertiary dark:border-tertiary",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
              {isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Focus Time"}
            </span>
            <span className={cn("text-sm font-normal", isDarkMode ? "text-primary" : "text-tertiary")}>
              Session {sessionCount + 1} {isBreak ? "(Break)" : ""}
            </span>
          </CardTitle>
          <CardDescription className={cn(isDarkMode ? "text-primary/70" : "text-tertiary/70")}>
            {currentTask ? `Current Task: ${currentTask.title}` : "No task selected"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col items-center">
            <div className="text-6xl font-bold my-6 relative">
              <span className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>{formatTime(timeLeft)}</span>
              <div
                className="absolute -bottom-4 left-0 h-1 bg-gradient-to-r from-tertiary to-secondary"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div className="flex gap-2 my-4">
              {!isRunning ? (
                <Button
                  onClick={startTimer}
                  size="lg"
                  className="gap-2 bg-tertiary hover:bg-secondary hover:text-tertiary text-primary"
                >
                  <Play className="h-4 w-4" />
                  {timeLeft === (isBreak ? (isLongBreak ? longBreakDuration : breakDuration) : workDuration) * 60
                    ? "Start"
                    : "Continue"}
                </Button>
              ) : (
                <Button
                  onClick={pauseTimer}
                  size="lg"
                  variant="outline"
                  className="gap-2 border-tertiary text-tertiary hover:bg-tertiary hover:text-primary dark:text-primary dark:border-primary dark:hover:text-tertiary dark:hover:bg-primary"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button
                onClick={resetTimer}
                size="lg"
                variant="outline"
                className="gap-2 border-secondary text-tertiary hover:bg-secondary dark:text-primary dark:border-primary dark:hover:text-tertiary dark:hover:bg-primary"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={skipToNextPhase}
                size="lg"
                variant="outline"
                className="gap-2 border-secondary text-tertiary hover:bg-secondary dark:text-primary dark:border-primary dark:hover:text-tertiary dark:hover:bg-primary"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isBreak ? "Skip to Focus" : "Skip to Break"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-secondary">
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isDarkMode ? "text-primary" : "text-tertiary")}>Session Notes</CardTitle>
          <CardDescription className={cn(isDarkMode ? "text-primary/70" : "text-tertiary/70")}>
            Take notes for your current Pomodoro session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What are you working on? Add notes here..."
            className={cn(
              "min-h-[100px] border-secondary focus:border-tertiary",
              isDarkMode ? "text-primary placeholder:text-primary/50" : "text-tertiary placeholder:text-tertiary/50",
            )}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="border-secondary">
        <CardHeader className="pb-2">
          <Button
            variant="ghost"
            className={cn(
              "p-0 h-auto font-semibold text-lg w-full text-left justify-start flex items-center",
              isDarkMode ? "text-primary hover:text-primary/80" : "text-tertiary hover:text-tertiary/80",
            )}
            onClick={() => setShowSettings(!showSettings)}
          >
            Timer Settings
            {showSettings ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                  Focus Duration: {workDuration} min
                </Label>
              </div>
              <Slider
                value={[workDuration]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setWorkDuration(value[0])}
                className="text-tertiary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                  Short Break: {breakDuration} min
                </Label>
              </div>
              <Slider
                value={[breakDuration]}
                min={1}
                max={15}
                step={1}
                onValueChange={(value) => setBreakDuration(value[0])}
                className="text-tertiary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                  Long Break: {longBreakDuration} min
                </Label>
              </div>
              <Slider
                value={[longBreakDuration]}
                min={5}
                max={30}
                step={5}
                onValueChange={(value) => setLongBreakDuration(value[0])}
                className="text-tertiary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                  Sessions before long break: {sessionsBeforeLongBreak}
                </Label>
              </div>
              <Slider
                value={[sessionsBeforeLongBreak]}
                min={2}
                max={6}
                step={1}
                onValueChange={(value) => setSessionsBeforeLongBreak(value[0])}
                className="text-tertiary"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="auto-start-breaks" checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
              <Label htmlFor="auto-start-breaks" className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                Auto-start breaks
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="auto-start-pomodoros" checked={autoStartPomodoros} onCheckedChange={setAutoStartPomodoros} />
              <Label htmlFor="auto-start-pomodoros" className={cn(isDarkMode ? "text-primary" : "text-tertiary")}>
                Auto-start pomodoros
              </Label>
            </div>

            <Button
              onClick={saveSettings}
              disabled={isSavingSettings}
              className="w-full mt-2 bg-tertiary hover:bg-secondary hover:text-tertiary text-primary relative"
            >
              {isSavingSettings ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </div>
              ) : saveSuccess ? (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Settings Saved!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </div>
              )}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
