import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET a specific task
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const id = params.id
    console.log(`Fetching task with ID: ${id} for user: ${userId}`)

    await dbConnect()

    const task = await Task.findOne({ _id: id, userId })

    if (!task) {
      console.log(`Task with ID ${id} not found for user ${userId}`)
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

// PUT (update) a task
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const id = params.id
    console.log(`Updating task with ID: ${id} for user: ${userId}`)

    const body = await request.json()
    console.log("Update payload:", body)

    await dbConnect()

    // Find and update the task
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      { ...body },
      { new: true, runValidators: true },
    )

    if (!updatedTask) {
      console.log(`Task with ID ${id} not found for user ${userId}`)
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    console.log(`Task with ID ${id} updated successfully for user ${userId}`)
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE a task
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const id = params.id
    console.log(`Deleting task with ID: ${id} for user: ${userId}`)

    await dbConnect()

    const deletedTask = await Task.findOneAndDelete({ _id: id, userId })

    if (!deletedTask) {
      console.log(`Task with ID ${id} not found for deletion for user ${userId}`)
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    console.log(`Task with ID ${id} deleted successfully for user ${userId}`)
    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
