import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import Session from "@/models/Session"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    await dbConnect()

    // Get counts from MongoDB
    const taskCount = await Task.countDocuments({ userId })
    const sessionCount = await Session.countDocuments({ userId })

    // Get most recent task and session
    const latestTask = await Task.findOne({ userId }).sort({ createdAt: -1 })
    const latestSession = await Session.findOne({ userId }).sort({ completedAt: -1 })

    return NextResponse.json({
      counts: {
        tasks: taskCount,
        sessions: sessionCount,
      },
      latest: {
        task: latestTask
          ? {
              id: latestTask._id,
              title: latestTask.title,
              createdAt: latestTask.createdAt,
            }
          : null,
        session: latestSession
          ? {
              id: latestSession._id,
              taskTitle: latestSession.taskTitle,
              completedAt: latestSession.completedAt,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Error checking data integrity:", error)
    return NextResponse.json({ error: "Failed to check data integrity" }, { status: 500 })
  }
}
