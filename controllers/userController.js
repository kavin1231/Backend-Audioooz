import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Register a new user
export function registerUser(req, res) {
  const data = req.body;

  data.password = bcrypt.hashSync(data.password, 10);
  const newUser = new User(data);

  newUser
    .save()
    .then(() => {
      res.json({ message: "User registered successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "User registration failed" });
    });
}

// Login a user
export function loginUser(req, res) {
  const data = req.body;

  User.findOne({ email: data.email }).then((user) => {
    if (user == null) {
      res.status(404).json({ error: "User not found" });
    } else {
      const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);

      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            phone: user.phone,
          },
          process.env.JWT_SECRET
        );

        res.json({ message: "Login successful", token: token, user: user });
      } else {
        res.status(401).json({ error: "Login failed" });
      }
    }
  });
}

// Get a single user by ID
export function getUser(req, res) {
  const userId = req.params.id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.json(user);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to retrieve user" });
    });
}

// Get all users
export function getAllUsers(req, res) {
  User.find()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      res.status(500).json({ error: "Failed to retrieve users" });
    });
}

// Check if user is admin
export function isItAdmin(req) {
  return req.user != null && req.user.role === "admin";
}

// Check if user is customer
export function isItCustomer(req) {
  return req.user != null && req.user.role === "customer";
}
