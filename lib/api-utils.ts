import { NextResponse } from "next/server"
import mongoose from "mongoose"

export async function checkDbConnection() {
  if (mongoose.connection.readyState !== 1) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 503 })
  }
  return null
}
