// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const userRoutes = require("./routes/UserRoutes");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const photoRoutes = require("./routes/photoRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/users", userRoutes);
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "Only image files allowed") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});
app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.error("DB connection error:", err));
