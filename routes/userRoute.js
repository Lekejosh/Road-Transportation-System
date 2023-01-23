const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendOtp,
  logoutUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  createDriverReview,
} = require("../controllers/userController");

const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router
  .route("/email/verification")
  .post(isAuthenticatedUser, verifyEmail)
  .get(isAuthenticatedUser, resendOtp);
router.route("/logout").get(isAuthenticatedUser, logoutUser);
router
  .route("/update")
  .put(isAuthenticatedUser, updateProfile)
  .post(isAuthenticatedUser, updatePassword);
router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/review").post(isAuthenticatedUser, createDriverReview);

module.exports = router;
