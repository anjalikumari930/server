import mongoose from "mongoose";

//schema for user
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
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
    role: {
      type: String,
      enum: ["admin", "employee","superadmin"],
      default: "employee",
    },
  }, 
  { timestamps: true }
);

export default mongoose.model("user", userSchema);
