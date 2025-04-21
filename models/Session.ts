import mongoose from "mongoose"

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  taskTitle: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Session || mongoose.model("Session", SessionSchema)
