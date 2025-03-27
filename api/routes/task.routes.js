import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { createTask, deleteTask, filterTasksByPriority, filterTasksByStatus, getTasks, searchTasks, updateTask, updateTaskPriority, updateTaskStatus } from "../controllers/taskController.js";


const router = express.Router();

router.get("/tasks",protectRoute,getTasks);
router.post("/create",protectRoute,createTask);
router.put("/update/:id",protectRoute,updateTask);
router.delete("/delete/:id",protectRoute,deleteTask);
router.get("/search",protectRoute,searchTasks);
router.get("/bystatus",protectRoute,filterTasksByStatus);
router.get("/bypriority",protectRoute,filterTasksByPriority);
router.patch("/priority/:id", protectRoute, updateTaskPriority);
router.patch("/status/:id", protectRoute, updateTaskStatus);

export default router;
