import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check for demo user
    if (email === "test@example.com" && password === "password") {
      return NextResponse.json({
        user: {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
        },
        success: true,
      })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Return user without password
    const userWithoutPassword = {
      id: user._id.toString(), // Ensure ID is a string
      name: user.name,
      email: user.email,
    }

    console.log("Login successful for:", email, "User ID:", userWithoutPassword.id)

    return NextResponse.json({
      user: userWithoutPassword,
      success: true,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login", success: false }, { status: 500 })
  }
}
