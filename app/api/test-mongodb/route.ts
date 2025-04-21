import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    console.log("Testing MongoDB connection...")
    await dbConnect()
    console.log("MongoDB connected successfully")

    // Try to count users
    const userCount = await User.countDocuments()
    console.log(`Found ${userCount} users in the database`)

    return NextResponse.json({
      status: "success",
      message: "MongoDB connection successful",
      userCount,
    })
  } catch (error) {
    console.error("MongoDB connection test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "MongoDB connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
