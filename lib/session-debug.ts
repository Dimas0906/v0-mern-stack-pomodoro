// Debug utility functions for session data

export function debugSessionData(userId: string) {
  try {
    // Check localStorage for sessions
    const localStoragePrefix = `pomodoro-${userId}-`
    const sessionsKey = `${localStoragePrefix}sessions`

    const localSessions = localStorage.getItem(sessionsKey)
    const parsedSessions = localSessions ? JSON.parse(localSessions) : []

    console.group("Session Debug Data")
    console.log("User ID:", userId)
    console.log("Sessions in localStorage:", parsedSessions.length)

    if (parsedSessions.length > 0) {
      console.log("Most recent session:", parsedSessions[parsedSessions.length - 1])

      // Group by date
      const sessionsByDate = parsedSessions.reduce((acc: Record<string, any[]>, session: any) => {
        try {
          const date = new Date(session.completedAt).toLocaleDateString()
          if (!acc[date]) {
            acc[date] = []
          }
          acc[date].push(session)
        } catch (error) {
          console.error("Error processing session date:", error, session)
        }
        return acc
      }, {})

      console.log("Sessions by date:", sessionsByDate)
    }

    console.groupEnd()

    return {
      count: parsedSessions.length,
      sessions: parsedSessions,
    }
  } catch (error) {
    console.error("Error debugging session data:", error)
    return {
      error: String(error),
      count: 0,
      sessions: [],
    }
  }
}

export function validateSessionData(sessions: any[]) {
  const issues: string[] = []

  sessions.forEach((session, index) => {
    if (!session._id) {
      issues.push(`Session ${index} is missing _id`)
    }

    if (!session.taskId) {
      issues.push(`Session ${index} is missing taskId`)
    }

    if (!session.taskTitle) {
      issues.push(`Session ${index} is missing taskTitle`)
    }

    if (typeof session.duration !== "number") {
      issues.push(`Session ${index} has invalid duration: ${session.duration}`)
    }

    if (!session.completedAt) {
      issues.push(`Session ${index} is missing completedAt`)
    } else {
      try {
        new Date(session.completedAt)
      } catch (e) {
        issues.push(`Session ${index} has invalid completedAt date: ${session.completedAt}`)
      }
    }
  })

  return {
    valid: issues.length === 0,
    issues,
  }
}
