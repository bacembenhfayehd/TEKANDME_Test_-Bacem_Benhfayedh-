import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { getUserProfile, updateUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.post("/update", protectRoute, updateUser);

export default router;
