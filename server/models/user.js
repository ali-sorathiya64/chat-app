import mongoose, { Schema, model } from "mongoose";
import { hash } from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: false, // Optional bio
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Password won't be returned in queries by default
    },
    avatar: {
      public_id: {
        type: String,
        required: false, // Avatar can be optional
      },
      url: {
        type: String,
        required: false, // Avatar URL can also be optional
      },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Hash only if the password is modified
  this.password = await hash(this.password, 10);
  next();
});

// Export the User model, creating it if it doesn't already exist
export const User = mongoose.models.User || model("User", userSchema);

