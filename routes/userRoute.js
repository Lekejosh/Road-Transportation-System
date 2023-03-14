const express = require("express");
const router = express.Router();
const {
  // welcome,
  registerUser,
  loginUser,
  verifyEmail,
  resendOtp,
  logoutUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateAvatar,
  userDetails,
} = require("../controllers/userController");
const upload = require("../utils/multer");
const { isAuthenticatedUser } = require("../middlewares/auth");

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route('/me').get(isAuthenticatedUser,userDetails)
router
  .route("/email/verification")
  .post(isAuthenticatedUser, verifyEmail)
  .get(isAuthenticatedUser, resendOtp);
router.route("/logout").get(isAuthenticatedUser, logoutUser);
router
  .route("/update")
  .put(isAuthenticatedUser, updateProfile)
  .post(isAuthenticatedUser, updatePassword);
router.route("/update/avatar").put(upload.single("avatar"),isAuthenticatedUser, updateAvatar);
router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

module.exports = router;
