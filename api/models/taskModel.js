import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        enum: ["To Do", "In Progress", "Completed"],
        required: true,
      },
      priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: true,
      },
      dueDate: {
        type: Date,
        required: false,
      },
      user: {
        type: String,
        required: true,
      },
  
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default User;
