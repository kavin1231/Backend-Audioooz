import Product from "../models/product.js";

export function addProduct(req, res) {
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



