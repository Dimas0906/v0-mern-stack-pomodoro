import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request: Request) {
  try {
    await dbConnect()

    // Get email from query params
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({
        found: false,
        message: `No user found with email: ${email}`,
      })
    }

    // Return user info without sensitive data
    return NextResponse.json({
      found: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Debug route error:", error)
    return NextResponse.json({ error: "Failed to check user" }, { status: 500 })
  }
}
