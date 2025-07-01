import Product from "../models/product.js";

export function addProduct(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Please login and try again",
    });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(401).json({
      message: "You are not authorized to add products",
    });
    return;
  }
  const data = req.body;

  const newProduct = new Product(data);

  newProduct
    .save()
    .then(() => {
      res.json({ message: "Product added successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Product addition failed" });
    });
}

export async function getProducts(req, res) {
  try {
    const products = await Product.find();
    if (isItAdmin(req)) {
      res.json(products);
      return;
    } else {
      const products = await Product.find({ availability: true });
      res.json(products);
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

function isItAdmin(req) {
  let isAdmin = false;

  if (req.user != null) {
    if (req.user.role === "admin") {
      isAdmin = true;
    }
  }
  return isAdmin;
}
