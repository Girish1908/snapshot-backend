const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Photo = require("../models/Photo");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/multerSetup");


router.put("/update-profile", auth, upload.single("photo"), async (req, res) => {
  const updates = {};
  if (req.file) {
    updates.profilePhoto = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }
  if (req.body.bio !== undefined) updates.bio = req.body.bio;

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("username bio");
  res.json({ message: "Profile updated", user });
});


router.get("/notifications", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("notifications.photo", "caption")
      .populate("notifications.fromUser", "username profilePhoto");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.notifications.reverse());
  } catch (err) {
    console.error("Notifications error:", err.message);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});


router.get("/image/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.profilePhoto?.data) {
    return res.status(404).send("No profile photo found");
  }
  res.set("Content-Type", user.profilePhoto.contentType);
  res.send(user.profilePhoto.data);
});


router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("username bio profilePhoto");
  const photos = await Photo.find({ user: req.params.id });

  const response = photos.map(p => ({
    ...p.toObject(),
    imageUrl: `/api/photos/image/${p._id}`
  }));

  res.json({
    user: {
      _id: user._id,
      username: user.username,
      bio: user.bio,
      profilePhotoUrl: user.profilePhoto?.data
        ? `/api/users/image/${user._id}`
        : null
    },
    photos: response,
    postCount: photos.length
  });
});

module.exports = router;