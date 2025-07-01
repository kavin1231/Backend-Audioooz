import Review from "../models/review.js";

export function addReview(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Please login and try again",
    });
    return;
  }

  const data = req.body;
  data.email = req.user.email;
  data.name = req.user.firstname + " " + req.user.lastname;
  data.rating = parseInt(data.rating, 10);
  data.profilePicture = req.user.profilePicture;

  const newReview = new Review(data);

  newReview
    .save()
    .then(() => {
      res.json({ message: "Review added successfully" });
    })
    .catch((error) => {
      res.status(500).json({ error: "Review addition failed" });
    });
}

export async function getReviews(req, res) {
 const user= req.user;
  try {
    if(user.role === "admin") {
      const reviews = await Review.find();
      res.json(reviews);
    }else {
      const reviews = await Review.find({ isApproved: true });
      res.json(reviews);
    }   
    } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
    }
}
export function deleteReview(req, res) {
  const email = req.params.email;

  if (req.user == null) {
    res.status(401).json({
      message: "Please login and try again",
    });
    return;
  }
  if (req.user.role !== "admin") {
    Review.deleteOne({ email: email })
      .then(() => {
        res.json({ message: "Review deleted successfully" });
      })
      .catch((error) => {
        res.status(500).json({ error: "Failed to delete review" });
      });
    return;
  }
  if (req.user.role === "customer") {
    if (req.user.email == email) {
      Review.deleteOne({ email: email })
        .then(() => {
          res.json({ message: "Review deleted successfully" });
        })
        .catch((error) => {
          res.status(500).json({ error: "Failed to delete review" });
        });
    }
  } else {
    res.status(401).json({
      message: "You are not authorized to delete this review",
    });
    return;
  }
}

export function approveReview(req, res) {
  const email = req.params.email;

  if (req.user == null) {
    res.status(401).json({
      message: "Please login and try again",
    });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(401).json({
      message: "You are not authorized to approve reviews",
    });
    return;
  }
  if (req.user.role === "admin") {
    Review.updateOne({email:email}, {isApproved: true})
      .then(() => {
        res.json({ message: "Review approved successfully" });
      })
      .catch((error) => {
        res.status(500).json({ error: "Failed to approve review" });
      });
    return;
  }
}
