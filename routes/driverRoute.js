const express = require("express");
const router = express.Router();

const {
  registerDriver,
  findDriver,
  findOneDriver,
  createDriverReview,
  getDriverReviews,
  deleteDriverReview,
} = require("../controllers/userController");
const upload = require("../utils/multer");
const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router
  .route("/register")
  .put(upload.single("avatar"), isAuthenticatedUser, registerDriver);
router.route("/all").get(isAuthenticatedUser, findDriver);
router.route("/id").get(isAuthenticatedUser, findOneDriver);
router
  .route("/review")
  .post(isAuthenticatedUser, createDriverReview)
  .get(isAuthenticatedUser, getDriverReviews);
router.route("/get/review/:driverId")
router
  .route("/reviews/:reviewId")
  .delete(isAuthenticatedUser, deleteDriverReview);
module.exports = router;
