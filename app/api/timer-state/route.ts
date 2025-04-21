import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import TimerState from "@/models/TimerState"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET timer state for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`Fetching timer state for user: ${userId}`)

    await dbConnect()

    // Get timer state for the current user
    const timerState = await TimerState.findOne({ userId })

    if (!timerState) {
      return NextResponse.json(null)
    }

    return NextResponse.json(timerState)
  } catch (error) {
    console.error("Error fetching timer state:", error)
    return NextResponse.json({ error: "Failed to fetch timer state" }, { status: 500 })
  }
}

// PUT (update) timer state
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    await dbConnect()

    // Update timer state using upsert (create if doesn't exist)
    const updatedTimerState = await TimerState.findOneAndUpdate(
      { userId },
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true },
    )

    return NextResponse.json(updatedTimerState)
  } catch (error) {
    console.error("Error updating timer state:", error)
    return NextResponse.json({ error: "Failed to update timer state" }, { status: 500 })
  }
}
