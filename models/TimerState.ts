import mongoose from "mongoose"

const TimerStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  timeLeft: {
    type: Number,
    required: true,
  },
  isBreak: {
    type: Boolean,
    default: false,
  },
  isLongBreak: {
    type: Boolean,
    default: false,
  },
  sessionCount: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.TimerState || mongoose.model("TimerState", TimerStateSchema)
