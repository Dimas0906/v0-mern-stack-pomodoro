import dbConnect from "../lib/mongodb"
import Task from "../models/Task"
import Session from "../models/Session"
import User from "../models/User"
import Setting from "../models/Setting"
import TimerState from "../models/TimerState"

async function createIndexes() {
  try {
    console.log("Connecting to MongoDB...")
    await dbConnect()
    console.log("Connected to MongoDB")

    console.log("Creating indexes for Task collection...")
    await Task.createIndexes()

    console.log("Creating indexes for Session collection...")
    await Session.createIndexes()

    console.log("Creating indexes for User collection...")
    await User.createIndexes()

    console.log("Creating indexes for Setting collection...")
    await Setting.createIndexes()

    console.log("Creating indexes for TimerState collection...")
    await TimerState.createIndexes()

    console.log("All indexes created successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error creating indexes:", error)
    process.exit(1)
  }
}

createIndexes()
