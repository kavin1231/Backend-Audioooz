import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log("Request is here");
});

let mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connection established successfully");
});

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

app.listen(3005, () => {
  console.log("Server is runing on port 3005");
});
