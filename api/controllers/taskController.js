import Task from "../models/taskModel.js";

export const createTask = async (req, res) => {
  try {
    const userId = req.user._id;

    const { title, description, status, priority, startDate, dueDate } =
      req.body;

    if (!title) {
      return {
        success: false,
        message: "Le titre est obligatoire",
      };
    }

    const start = startDate ? new Date(startDate) : new Date();
    const due = dueDate ? new Date(dueDate) : null;

    if (due && due < start) {
      return {
        success: false,
        message: "La date de fin doit être postérieure à la date de début",
      };
    }

    if (status && !["To Do", "In Progress", "Completed"].includes(status)) {
      return {
        success: false,
        message: "Statut invalide",
      };
    }

    if (priority && !["Low", "Medium", "High"].includes(priority)) {
      return {
        success: false,
        message: "Priorité invalide",
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
    console.error("Erreur lors de la création de la tâche:", error);
    return {
      success: false,
      message: "Impossible de créer la tâche",
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
        message: "ID de tâche manquant",
      });
    }

    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée ou non autorisée",
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Tâche supprimée avec succès",
      deletedTaskId: id,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de supprimer la tâche",
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
        message: "ID de tâche manquant",
      });
    }

    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée ou non autorisée",
      });
    }

    const updateData = {};

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Le titre ne peut pas être vide",
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
            "La date de fin doit être postérieure ou égale à la date de début",
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
      message: "Tâches récupérées avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les tâches",
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
          "Priorité invalide. Les valeurs acceptées sont : Low, Medium, High.",
      });
    }

    const task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée ou non autorisée",
      });
    }

    task.priority = priority;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Priorité de la tâche mise à jour",
      task,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la priorité :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de mettre à jour la priorité",
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
        message: "Statut invalide",
        validStatuses: validStatuses,
      });
    }

    // Recherche des tâches avec le statut spécifié
    const tasks = await Task.find({
      user: userId,
      status: status,
    }).sort({ createdAt: -1 }); // Trier par date de création décroissante

    return res.status(200).json({
      success: true,
      message: `Tâches filtrées par statut : ${status}`,
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Erreur lors du filtrage des tâches:", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de filtrer les tâches",
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

    // Recherche des tâches avec le statut spécifié
    const tasks = await Task.find({
      user: userId,
      priority: priority,
    }).sort({ createdAt: -1 }); // Trier par date de création décroissante

    return res.status(200).json({
      success: true,
      message: `Tâches filtrées par statut : ${priority}`,
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Erreur lors du filtrage des tâches:", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de filtrer les tâches",
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
        message: "Terme de recherche requis",
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
      message: "Recherche de tâches effectuée",
      tasks: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de tâches:", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de rechercher les tâches",
      error: error.message,
    });
  }
};

//error handlers

//calender for tasks

//color&icons for tasks !!
