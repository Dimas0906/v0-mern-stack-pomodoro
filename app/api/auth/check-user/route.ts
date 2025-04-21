import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    console.log("Checking if user exists...")
    await dbConnect()

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const user = await User.findOne({ email })

    return NextResponse.json({
      exists: !!user,
      user: user
        ? {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          }
        : null,
    })
  } catch (error) {
    console.error("Check user error:", error)
    return NextResponse.json(
      {
        error: "Failed to check user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
