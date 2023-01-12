const { Router } = require("express");
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
  getAllUsers,
  getUser,
  deleteUser,
} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router
  .route("/email/verification")
  .post(isAuthenticatedUser, verifyEmail)
  .get(isAuthenticatedUser, resendOtp);
router.route("/logout").get(isAuthenticatedUser, logoutUser);
router.route("/update").put(isAuthenticatedUser, updateProfile).post(isAuthenticatedUser, updatePassword);
router.route('/password/forgot').post(forgotPassword)

router.route('/password/reset/:token').put(resetPassword)
router.route('/all').get(isAuthenticatedUser, authorizeRole("admin"),getAllUsers)
router
  .route("/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getUser)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser)
  .patch(isAuthenticatedUser, authorizeRole("admin"), updateUser);


module.exports = router;
