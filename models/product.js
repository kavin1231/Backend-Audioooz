import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: [String],
    required: true,
    default:[
      "https://img.freepik.com/free-psd/contact-icon-illustration-isolated_23-2151903337.jpg?t=st=1737020897~exp=1737024497~hmac=dbfa34d34e8727f17588ef829039ae4df14d88f388a0c520997a0fe7ea2b20cf&w=740"],
  },
  category: {
    type: String,
    required: true,
    default: "uncategorized",
  },
  subcategory: {
    type: String,
    required: true,
    default: "uncategorized",
  },
  dimensions: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
