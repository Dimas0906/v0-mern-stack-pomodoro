import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pomodoro"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect(retries = 3) {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }

    cached.promise = (async () => {
      let lastError = null
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`MongoDB connection attempt ${i + 1} of ${retries}...`)
          return await mongoose.connect(MONGODB_URI, opts)
        } catch (error) {
          console.error(`MongoDB connection attempt ${i + 1} failed:`, error)
          lastError = error
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
        }
      }
      throw lastError || new Error("Failed to connect to MongoDB")
    })()
  }

  try {
    cached.conn = await cached.promise
    console.log("MongoDB connected successfully")
    return cached.conn
  } catch (error) {
    cached.promise = null
    throw error
  }
}

export default dbConnect
