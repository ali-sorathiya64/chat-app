import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import {
  cookieOptions,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";

// Create a new user and save it to the database and save token in cookie
const newUser = TryCatch(async (req, res, next) => {
  const { name, username, password, bio } = req.body;
  const file = req.file;

  let avatar = { public_id: "", url: "" }; // Default avatar
  if (file) {
    const result = await uploadFilesToCloudinary([file]);
    avatar = { public_id: result[0].public_id, url: result[0].url };
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) return next(new ErrorHandler("Username already taken.", 400));

  const user = await User.create({
    name,
    bio,
    username,
    password,
    avatar,
  });

  sendToken(res, user, 201, "User created successfully.");
});

// Login user and save token in cookie
const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid Username or Password.", 401));

  const isMatch = await compare(password, user.password);
  if (!isMatch) return next(new ErrorHandler("Invalid Username or Password.", 401));

  sendToken(res, user, 200, `Welcome Back, ${user.name}!`);
});

// Get user profile
const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  if (!user) return next(new ErrorHandler("User not found.", 404));

  res.status(200).json({ success: true, user });
});

// Update user profile
const updateProfile = TryCatch(async (req, res, next) => {
  const { bio } = req.body;
  const file = req.file;

  const user = await User.findById(req.user);
  if (!user) return next(new ErrorHandler("User not found.", 404));

  if (file) {
    const result = await uploadFilesToCloudinary([file]);
    user.avatar = { public_id: result[0].public_id, url: result[0].url };
  }

  if (bio) user.bio = bio;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user,
  });
});

// Logout user
const logout = TryCatch(async (req, res) => {
  res
    .status(200)
    .cookie("token", "", { ...cookieOptions, maxAge: 0 })
    .json({ success: true, message: "Logged out successfully." });
});

// Search for users
const searchUser = TryCatch(async (req, res) => {
  const { name = "" } = req.query;

  const myChats = await Chat.find({ groupChat: false, members: req.user });
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  const users = await User.find({
    _id: { $nin: [...allUsersFromMyChats, req.user] }, // Exclude current user
    name: { $regex: name, $options: "i" },
  }).select("name avatar");

  const modifiedUsers = users.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar?.url || "",
  }));

  res.status(200).json({ success: true, users: modifiedUsers });
});

// Send friend request
const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const existingRequest = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (existingRequest)
    return next(new ErrorHandler("Friend request already sent or received.", 400));

  await Request.create({ sender: req.user, receiver: userId });
  emitEvent(req, NEW_REQUEST, [userId]);

  res.status(200).json({ success: true, message: "Friend request sent." });
});

// Accept or reject friend request
const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) return next(new ErrorHandler("Request not found.", 404));
  if (request.receiver._id.toString() !== req.user.toString())
    return next(new ErrorHandler("Unauthorized action.", 403));

  if (!accept) {
    await request.deleteOne();
    return res.status(200).json({ success: true, message: "Friend request rejected." });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);
  res.status(200).json({ success: true, message: "Friend request accepted." });
});

// Get notifications
const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar?.url || "",
    },
  }));

  res.status(200).json({ success: true, allRequests });
});

// Get friends list
const getMyFriends = TryCatch(async (req, res) => {
  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherUser = members.find((m) => m._id.toString() !== req.user.toString());
    return {
      _id: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatar?.url || "",
    };
  });

  res.status(200).json({ success: true, friends });
});

export {
  newUser,
  login,
  getMyProfile,
  updateProfile,
  logout,
  searchUser,
  sendFriendRequest,
  acceptFriendRequest,
  getMyNotifications,
  getMyFriends,
};
