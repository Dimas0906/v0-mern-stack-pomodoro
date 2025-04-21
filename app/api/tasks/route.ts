import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { checkDbConnection } from "@/lib/api-utils"
import { handleApiError } from "@/lib/error-handler"

// GET all tasks for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("Unauthorized access attempt to tasks API")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`Fetching tasks for user: ${userId}`)

    await dbConnect()

    // Check if database connection is available
    const connectionError = await checkDbConnection()
    if (connectionError) return connectionError

    // Get all tasks for the current user
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 })
    console.log(`Found ${tasks.length} tasks for user ${userId}`)

    return NextResponse.json(tasks)
  } catch (error) {
    return handleApiError(error, "fetch tasks")
  }
}

// POST a new task
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("Unauthorized access attempt to create task")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { title, description } = body

    if (!title) {
      console.log("Task creation failed: Title is required")
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if database connection is available
    const connectionError = await checkDbConnection()
    if (connectionError) return connectionError

    // Create new task
    const newTask = await Task.create({
      userId,
      title,
      description: description || "",
      completed: false,
      pomodoros: 0,
    })

    console.log(`Task created successfully: ${newTask._id}`)
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    return handleApiError(error, "create task")
  }
}
