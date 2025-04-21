import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Task from "@/models/Task"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/error-handler"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    await dbConnect()

    // Try to create a task with the provided data
    // This will validate the schema
    const task = new Task({
      userId,
      ...body,
    })

    // Validate without saving
    await task.validate()

    return NextResponse.json({
      valid: true,
      message: "Data is valid according to the schema",
    })
  } catch (error) {
    return handleApiError(error, "validate schema")
  }
}
