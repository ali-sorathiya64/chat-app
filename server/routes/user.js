import express from "express";
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
  updateProfile,
} from "../controllers/user.js"; // Ensure the path matches your project structure

import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from "../lib/validators.js"; // Ensure the validators are implemented and properly exported
import { isAuthenticated } from "../middlewares/auth.js";
import { singleAvatar } from "../middlewares/multer.js"; // Ensure multer is configured correctly for file handling

const app = express.Router();

// ================== Public Routes ==================

// Register a new user
app.post(
  "/new",
  singleAvatar, // Middleware for handling avatar uploads
  registerValidator(), // Validate user registration input
  validateHandler, // Handle validation errors
  newUser // Controller for user registration
);

// Login route
app.post(
  "/login",
  loginValidator(), // Validate login input
  validateHandler, // Handle validation errors
  login // Controller for user login
);

// ================== Protected Routes (Authenticated) ==================

// Middleware to ensure the user is authenticated
app.use(isAuthenticated);

// Get the currently logged-in user's profile
app.get("/me", getMyProfile);

// Logout route
app.get("/logout", logout);

// Search for other users
app.get("/search", searchUser);

// Update the user's profile (bio and avatar)
app.put(
  "/update",
  singleAvatar, // Middleware for handling avatar uploads
  updateProfile // Controller for updating user profile
);

// Send a friend request
app.put(
  "/sendrequest",
  sendRequestValidator(), // Validate request input
  validateHandler, // Handle validation errors
  sendFriendRequest // Controller for sending friend request
);

// Accept a friend request
app.put(
  "/acceptrequest",
  acceptRequestValidator(), // Validate request input
  validateHandler, // Handle validation errors
  acceptFriendRequest // Controller for accepting/rejecting friend requests
);

// Get user notifications
app.get("/notifications", getMyNotifications);

// Get the user's friends list
app.get("/friends", getMyFriends);

export default app;
