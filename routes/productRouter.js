import express from "express";
import {
  addProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", addProduct);
productRouter.get("/", getProducts);
productRouter.get("/:key", getProduct);
productRouter.put("/:key", updateProduct);
productRouter.delete("/:key", deleteProduct);

export default productRouter;
