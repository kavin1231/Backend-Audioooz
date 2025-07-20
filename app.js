import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";

import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import inquiryRouter from "./routes/inquiryRouter.js";
import orderRouter from "./routes/orderRouter.js";

dotenv.config();

const app = express();

// ✅ CORS CONFIGURATION
const allowedOrigins = [
  "https://frontend-audioooz.vercel.app",                                    // Main domain
  "https://frontend-audioooz-git-main-kavins-projects-839c40b0.vercel.app", // Git branch domain
  "https://frontend-audioooz-asietl5zm-kavins-projects-839c40b0.vercel.app", // Deployment-specific domain
  "http://localhost:3005",                                                   // Local development
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ BODY PARSER
app.use(bodyParser.json());

// ✅ AUTH TOKEN MIDDLEWARE
app.use((req, res, next) => {
  let token = req.header("Authorization");
  if (token != null) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  next();
});

// ✅ MONGO CONNECTION
let mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection established successfully");
});

// ✅ ROUTES
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/inquiries", inquiryRouter);
app.use("/api/orders", orderRouter);

// ✅ START SERVER
app.listen(3005, () => {
  console.log("Server is running on port 3005");
});
