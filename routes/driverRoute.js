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
const {
  isAuthenticatedUser,
  authorizeRole,
  checkVerified,
} = require("../middlewares/auth");
router.route("/register").put(
  upload.fields([
    { name: "licenceFront", maxCount: 1 },
    { name: "licenceBack", maxCount: 1 },
    { name: "carImageFront", maxCount: 1 },
    { name: "carImageBack", maxCount: 1 },
    { name: "carImageSide", maxCount: 1 },
  ]),
  isAuthenticatedUser,
  checkVerified,
  registerDriver
);

router
  .route("/all")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("admin"), findDriver);
router.route("/id").get(isAuthenticatedUser, checkVerified, findOneDriver);
router
  .route("/review")
  .post(isAuthenticatedUser, checkVerified, createDriverReview)
  .get(isAuthenticatedUser, checkVerified, getDriverReviews);
router.route("/get/review/:driverId");
router
  .route("/reviews/:reviewId")
  .delete(isAuthenticatedUser, checkVerified, deleteDriverReview);
module.exports = router;
