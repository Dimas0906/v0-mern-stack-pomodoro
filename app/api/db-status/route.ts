import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"

export async function GET() {
  try {
    // Try to connect to MongoDB
    await dbConnect()

    // Check connection state
    const isConnected = mongoose.connection.readyState === 1

    if (isConnected) {
      return NextResponse.json({ status: "connected" })
    } else {
      return NextResponse.json({ status: "disconnected", error: "Database not connected" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json(
      {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}
