const express = require("express");

const {
  registerUser,
  loginUser,
  googleLogin,
  verifyEmail,
  resendVerificationEmail,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* Registration and login */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

/* Email verification */
router.get(
  "/verify-email/:token",
  verifyEmail
);

router.post(
  "/resend-verification",
  resendVerificationEmail
);

/* Protected account routes */
router.get(
  "/profile",
  protect,
  getProfile
);

router.put(
  "/profile",
  protect,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePassword
);

module.exports = router;
