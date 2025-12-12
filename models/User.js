import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },

  role: { type: Number, default: 20 },
});

export default mongoose.model("User", UserSchema);
