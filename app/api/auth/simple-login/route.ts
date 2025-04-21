import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    console.log("Simple login attempt...")
    await dbConnect()
    console.log("MongoDB connected for simple login")

    const body = await request.json()
    const { email, password } = body

    console.log(`Login attempt for email: ${email}`)

    // Check for demo user
    if (email === "test@example.com" && password === "password") {
      console.log("Demo user login successful")
      return NextResponse.json({
        success: true,
        message: "Demo login successful",
        user: {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
        },
      })
    }

    // Find user by email
    const user = await User.findOne({ email })
    console.log("User search result:", user ? "User found" : "User not found")

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    console.log("Password validation:", isPasswordValid ? "Valid" : "Invalid")

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: "Invalid password",
      })
    }

    // Return user data
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Simple login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
