// routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUser); // GET single user by ID
router.get("/all", getAllUsers); // GET all users

export default router;
