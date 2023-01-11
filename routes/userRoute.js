const { Router } = require("express");
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyEmail,
  resendOtp,
  logoutUser,
} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router
  .route("/email/verification")
  .post(isAuthenticatedUser, verifyEmail)
  .get(isAuthenticatedUser, resendOtp);
  router.route('/logout').get(isAuthenticatedUser,logoutUser)

module.exports = router;
