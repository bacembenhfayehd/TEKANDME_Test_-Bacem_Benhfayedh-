import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed"],
      required: true,
      default: "To Do",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default:"Medium",
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: false,
      validate: {
        validator: function(value) {
          // Si une date de fin est définie, la comparer avec la date de début
          // Utiliser une comparaison avec des timestamps pour éviter les problèmes de fuseau horaire
          return !value || !this.startDate || new Date(value).getTime() >= new Date(this.startDate).getTime();
        },
        message: "La date de fin doit être postérieure ou égale à la date de début"
      }
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
