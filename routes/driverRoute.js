const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

const {
  registerDriver,
  loginDriver,
  verifyEmail,
  resendOtp,
  logoutUser,
  updatePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/driverController");

router.route('/register').post(registerDriver)
router.route('/login').post(loginDriver)
router
  .route("/email/verification")
  .post(isAuthenticatedUser, verifyEmail)
  .get(isAuthenticatedUser, resendOtp);
router.route("/logout").get(isAuthenticatedUser,authorizeRole("driver"), logoutUser);
router
  .route("/update")
  .put(isAuthenticatedUser, updateProfile)
  .post(isAuthenticatedUser, updatePassword);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);