import mongoose from "mongoose"

const SettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  workDuration: {
    type: Number,
    default: 25,
  },
  breakDuration: {
    type: Number,
    default: 5,
  },
  longBreakDuration: {
    type: Number,
    default: 15,
  },
  sessionsBeforeLongBreak: {
    type: Number,
    default: 4,
  },
  autoStartBreaks: {
    type: Boolean,
    default: false,
  },
  autoStartPomodoros: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema)
