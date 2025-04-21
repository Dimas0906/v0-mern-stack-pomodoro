import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Session from "@/models/Session"
import Task from "@/models/Task"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET all sessions for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`Fetching sessions for user: ${userId}`)

    await dbConnect()

    // Get all sessions for the current user
    const sessions = await Session.find({ userId }).sort({ completedAt: -1 })
    console.log(`Found ${sessions.length} sessions for user ${userId}`)

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

// POST a new session
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { taskId, taskTitle, duration } = body

    if (!taskId || !duration) {
      return NextResponse.json({ error: "TaskId and duration are required" }, { status: 400 })
    }

    await dbConnect()

    // Create new session
    const newSession = await Session.create({
      userId,
      taskId,
      taskTitle,
      duration,
      completedAt: new Date(),
    })

    // Update task pomodoro count
    await Task.findOneAndUpdate({ _id: taskId, userId }, { $inc: { pomodoros: 1 } })

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
