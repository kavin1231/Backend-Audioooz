import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  profilePicture: {
    type: String,
    required: true,
    default: "https://img.freepik.com/free-psd/contact-icon-illustration-isolated_23-2151903337.jpg?t=st=1737020897~exp=1737024497~hmac=dbfa34d34e8727f17588ef829039ae4df14d88f388a0c520997a0fe7ea2b20cf&w=740",
  },
  isApproved: {
    type: Boolean,
    default: false,
    required: true,
  },
});
const Review = mongoose.model("Review", reviewSchema);
export default Review;
