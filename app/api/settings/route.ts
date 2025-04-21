import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Setting from "@/models/Setting"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET settings for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`Fetching settings for user: ${userId}`)

    await dbConnect()

    // Get settings for the current user
    let settings = await Setting.findOne({ userId })

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Setting.create({
        userId,
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT (update) settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    await dbConnect()

    // Update settings using upsert (create if doesn't exist)
    const updatedSettings = await Setting.findOneAndUpdate(
      { userId },
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true },
    )

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
