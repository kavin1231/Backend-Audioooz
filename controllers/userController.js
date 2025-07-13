import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

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
      console.error("Registration error:", error);
      res.status(500).json({ error: "User registration failed" });
    });
}

// Login a user
export function loginUser(req, res) {
  const data = req.body;

  User.findOne({
    email: data.email,
  })
    .then((user) => {
      if (user == null) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isBlocked) {
        return res
          .status(403)
          .json({ error: "Your account is blocked please contact the admin" });
      }

      const isPasswordCorrect = bcrypt.compareSync(
        data.password,
        user.password
      );

      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            phone: user.phone,
            emailVerified: user.emailVerified,
          },
          process.env.JWT_SECRET
        );

        res.json({ message: "Login successful", token: token, user: user });
      } else {
        res.status(401).json({ error: "Login failed" });
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    });
}

export async function getAllUsers(req, res) {
  if (isItAdmin(req)) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {
      console.error("Get all users error:", e);
      res.status(500).json({ error: "Failed to get users" });
    }
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
}

// Get a single user by ID
export function getUser(req, res) {
  if (req.user != null) {
    res.json(req.user);
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
}

export async function loginWithGoogle(req, res) {
  const accessToken = req.body.accessToken;
  console.log("Google access token:", accessToken);

  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Google user data:", response.data);

    const user = await User.findOne({
      email: response.data.email,
    });

    if (user != null) {
      if (user.isBlocked) {
        return res
          .status(403)
          .json({ error: "Your account is blocked please contact the admin" });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          phone: user.phone,
          emailVerified: true,
        },
        process.env.JWT_SECRET
      );

      res.json({ message: "Login successful", token: token, user: user });
    } else {
      const newUser = new User({
        email: response.data.email,
        password: bcrypt.hashSync("google-oauth-user", 10),
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        address: "Not Given",
        phone: "Not given",
        profilePicture: response.data.picture,
        emailVerified: true,
      });

      const savedUser = await newUser.save();
      const token = jwt.sign(
        {
          userId: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          role: savedUser.role,
          profilePicture: savedUser.profilePicture,
          phone: savedUser.phone,
          emailVerified: true,
        },
        process.env.JWT_SECRET
      );

      res.json({ message: "Login successful", token: token, user: savedUser });
    }
  } catch (e) {
    console.error("Google login error:", e);
    res.status(500).json({ error: "Failed to login with google" });
  }
}

export async function getProfile(req, res) {
  if (req.user == null) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (e) {
    console.error("Get profile error:", e);
    res.status(500).json({ error: "Failed to get profile" });
  }
}

export async function updateProfile(req, res) {
  if (req.user == null) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const updates = req.body;
  
  // Hash password if it's being updated
  if (updates.password) {
    updates.password = bcrypt.hashSync(updates.password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (e) {
    console.error("Update profile error:", e);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

export async function deleteAccount(req, res) {
  if (req.user == null) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: "Account deleted successfully" });
  } catch (e) {
    console.error("Delete account error:", e);
    res.status(500).json({ error: "Failed to delete account" });
  }
}

export async function updateUser(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const userId = req.params.id;
  const updates = req.body;

  if (updates.password) {
    updates.password = bcrypt.hashSync(updates.password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (e) {
    console.error("Update user error:", e);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function deleteUser(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (e) {
    console.error("Delete user error:", e);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

export async function getUsersByRole(req, res) {
  try {
    const { role } = req.params;
    
    // Handle URL-friendly role conversions
    let queryRole = role;
    if (role === "tool-dealer") queryRole = "tool dealer";
    else if (role === "agricultural-inspector") queryRole = "agricultural inspector";
    
    // Validate role
    const validRoles = ['customer', 'buyer', 'farmer', 'tool dealer', 'agricultural inspector', 'admin'];
    if (!validRoles.includes(queryRole)) {
      console.log(`Invalid role: ${queryRole}`);
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const users = await User.find({ role: queryRole });
    res.json(users);
  } catch (e) {
    console.error(`Get users by role error: ${e.message}`);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export const changePassword = async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Change password error:", e);
    res.status(500).json({ message: "Password change failed" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { imageUrl } = req.body;

  // Add validation for imageUrl
  if (!imageUrl || imageUrl.trim() === '') {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: imageUrl },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      message: "Profile picture updated successfully",
      imageUrl: updatedUser.profilePicture,
      user: updatedUser
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
};

// Check if user is admin
export function isItAdmin(req) {
  let isAdmin = false;

  if (req.user != null) {
    if (req.user.role == "admin") {
      isAdmin = true;
    }
  }

  return isAdmin;
}

// Check if user is customer
export function isItCustomer(req) {
  let isCustomer = false;

  if (req.user != null) {
    if (req.user.role == "customer") {
      isCustomer = true;
    }
  }

  return isCustomer;
}