const express = require("express");
const router = express.Router();
const { signup, login, sendOTP, verifyOTPAndResetPassword } = require("../contollers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", sendOTP);
router.post("/verify-otp", verifyOTPAndResetPassword);

router.get("/notifications", auth, async (req, res) => {
  const user = await User.findById(req.userId)
    .populate("notifications.photo", "caption")
    .populate("notifications.fromUser", "username");

  res.json(user.notifications.reverse());
});

module.exports = router;
