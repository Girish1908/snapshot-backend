const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

router.get("/notifications", auth, async (req, res) => {
  const user = await User.findById(req.userId)
    .populate("notifications.photo", "caption")
    .populate("notifications.fromUser", "username");

  res.json(user.notifications.reverse()); // recent first
});
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("username");
  const photos = await require("../models/Photo").find({ user: req.params.id });

  const response = photos.map(p => ({
    ...p.toObject(),
    imageUrl: `/api/photos/image/${p._id}`
  }));

  res.json({ user, photos: response });
});
module.exports = router;
