import Task from "../models/taskModel.js";

export const createTask = async (req, res) => {
  try {
    const userId = req.user._id;

    const { title, description, status, priority, startDate, dueDate } =
      req.body;

    if (!title) {
      return {
        success: false,
        message: "title required",
      };
    }

    const start = startDate ? new Date(startDate) : new Date();
    const due = dueDate ? new Date(dueDate) : null;

    if (due && due < start) {
      return {
        success: false,
        message: "due date must be > start date",
      };
    }

    if (status && !["To Do", "In Progress", "Completed"].includes(status)) {
      return {
        success: false,
        message: "Status incorrect",
      };
    }

    if (priority && !["Low", "Medium", "High"].includes(priority)) {
      return {
        success: false,
        message: "Priority incorrect",
      };
    }

    const taskData = {
      title,
      description,
      status: status || "To Do",
      priority: priority || "Medium",
      startDate: start,
      dueDate: due,
      user: userId,
    };

    const newTask = new Task(taskData);
    const savedTask = await newTask.save();

    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      message: "sorry:/",
      error: error.message,
    };
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID required",
      });
    }

    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "cannot find task",
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "deleted!",
      deletedTaskId: id,
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "sorry",
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, dueDate } = req.body;
    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id required",
      });
    }

    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "cannot find task",
      });
    }

    const updateData = {};

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "title required",
        });
      }
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (startDate !== undefined) {
      updateData.startDate = startDate;
    }

    if (dueDate !== undefined) {
      const effectiveStartDate = updateData.startDate || task.startDate;

      if (
        new Date(dueDate).getTime() < new Date(effectiveStartDate).getTime()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "due date > start date required",
        });
      }

      updateData.dueDate = dueDate;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "task updated",
      task: updatedTask,
    });
  } catch (error) {
    console.error("error:", error);

    
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "cannot update task :/",
      error: error.message,
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tasks,
      message: "fetched",
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "sorry",
      error: error.message,
    });
  }
};

export const updateTaskPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { priority } = req.body;

    const validPriorities = ["Low", "Medium", "High"];

    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message:
          "incorrect priority : Low, Medium, High.",
      });
    }

    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "cannot find task",
      });
    }

    task.priority = priority;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "updated",
      task,
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "sorry",
      error: error.message,
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { status } = req.body;

    const validStatus = ["To Do", "In Progress", "Completed"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "wrong status. value accepted : To Do, In Progress, Completed.",
      });
    }

    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "cannot find task or unauthorized",
      });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "updated",
      task,
    });
  } catch (error) {
    console.error("Error :", error);

    return res.status(500).json({
      success: false,
      message: "impossible to update",
      error: error.message,
    });
  }
};

export const filterTasksByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user._id;

    const validStatuses = ["To Do", "In Progress", "Completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status incorrect",
        validStatuses: validStatuses,
      });
    }

    
    const tasks = await Task.find({
      user: userId,
      status: status,
    }).sort({ createdAt: -1 }); 

    return res.status(200).json({
      success: true,
      message: `filtred by status : ${status}`,
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("error:", error);

    return res.status(500).json({
      success: false,
      message: "sorry :/",
      error: error.message,
    });
  }
};

export const filterTasksByPriority = async (req, res) => {
  try {
    const { priority } = req.query;
    const userId = req.user._id;

    const validPriorities = ["Low", "Medium", "High"];
    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Priority invalide",
        validPriorities: validPriorities,
      });
    }

    
    const tasks = await Task.find({
      user: userId,
      priority: priority,
    }).sort({ createdAt: -1 }); 

    return res.status(200).json({
      success: true,
      message: `Task filtred by priority : ${priority}`,
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "sorry :/",
      error: error.message,
    });
  }
};

export const searchTasks = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "need terms ",
      });
    }

    const tasks = await Task.find({
      user: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "searche ok",
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      success: false,
      message: "sorry",
      error: error.message,
    });
  }
};

//error handlers

//calender for tasks

//color&icons for tasks !!
