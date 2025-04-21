import mongoose from "mongoose"

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true, // Add index for better query performance
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  pomodoros: {
    type: Number,
    default: 0,
    min: [0, "Pomodoros count cannot be negative"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
TaskSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Add virtual for formatted dates
TaskSchema.virtual("formattedCreatedAt").get(function () {
  return this.createdAt.toLocaleDateString()
})

// Ensure virtuals are included in JSON
TaskSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id // Add id field for compatibility
    return ret
  },
})

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)
