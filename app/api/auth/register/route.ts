import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, email, password } = body

    console.log(`Registration attempt for: ${email}`)

    if (!name || !email || !password) {
      console.log("Registration failed: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log(`Registration failed: Email ${email} already in use`)
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    })

    // Return user without password
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }

    console.log(`Registration successful for: ${email}, User ID: ${userWithoutPassword.id}`)

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
