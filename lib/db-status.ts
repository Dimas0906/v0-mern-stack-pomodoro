import mongoose from "mongoose"

export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  error?: string
}> {
  try {
    // Check if mongoose is already connected
    if (mongoose.connection.readyState === 1) {
      return { connected: true }
    }

    // If not connected and no connection is in progress
    if (mongoose.connection.readyState === 0) {
      const MONGODB_URI = process.env.MONGODB_URI
      if (!MONGODB_URI) {
        return { connected: false, error: "MongoDB URI is not defined" }
      }

      // Try to connect
      await mongoose.connect(MONGODB_URI)
      return { connected: true }
    }

    // Connection is in progress
    return { connected: false, error: "Connection is in progress" }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown database connection error",
    }
  }
}
