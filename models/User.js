const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  
  profilePhoto: {
    data: Buffer,
    contentType: String
  },

  resetOtp: String,
  resetOtpExpiry: Date,

  notifications: [
    {
      type: { type: String, enum: ["like", "comment"] },
      photo: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
      fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      createdAt: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
