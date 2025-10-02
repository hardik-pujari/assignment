import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const existingModels = (mongoose as any)?.models;
const existingUserModel = existingModels
  ? (existingModels.User as any)
  : undefined;
export const User = existingUserModel || mongoose.model("User", userSchema);
