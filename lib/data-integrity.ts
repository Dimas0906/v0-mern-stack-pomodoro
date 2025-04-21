import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import Session from "@/models/Session"

export async function checkDataIntegrity(userId: string) {
  try {
    await dbConnect()

    // Get counts from MongoDB
    const taskCount = await Task.countDocuments({ userId })
    const sessionCount = await Session.countDocuments({ userId })

    // Get local storage data
    const localStoragePrefix = `pomodoro-${userId}-`
    let localTaskCount = 0
    let localSessionCount = 0

    try {
      const localTasks = localStorage.getItem(`${localStoragePrefix}tasks`)
      if (localTasks) {
        const parsedTasks = JSON.parse(localTasks)
        localTaskCount = parsedTasks.length
      }

      const localSessions = localStorage.getItem(`${localStoragePrefix}sessions`)
      if (localSessions) {
        const parsedSessions = JSON.parse(localSessions)
        localSessionCount = parsedSessions.length
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error)
    }

    return {
      mongodb: {
        tasks: taskCount,
        sessions: sessionCount,
      },
      localStorage: {
        tasks: localTaskCount,
        sessions: localSessionCount,
      },
      isConsistent: taskCount === localTaskCount && sessionCount === localSessionCount,
    }
  } catch (error) {
    console.error("Error checking data integrity:", error)
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      isConsistent: false,
    }
  }
}
