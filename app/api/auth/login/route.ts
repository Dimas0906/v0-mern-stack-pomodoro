import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, password } = body

    console.log(`Login attempt for email: ${email}`)

    if (!email || !password) {
      console.log("Login failed: Email and password are required")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check for demo user
    if (email === "test@example.com" && password === "password") {
      console.log("Demo user login successful")
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
      console.log(`Login failed: No user found with email ${email}`)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log(`User found in database: ${user._id} (${user.name})`)

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for user ${email}`)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Return user without password
    const userWithoutPassword = {
      id: user._id.toString(), // Ensure ID is a string
      name: user.name,
      email: user.email,
    }

    console.log(`Login successful for: ${email}, User ID: ${userWithoutPassword.id}`)

    return NextResponse.json({
      user: userWithoutPassword,
      success: true,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to login",
        success: false,
      },
      { status: 500 },
    )
  }
}
