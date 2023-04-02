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
router.route("/register").put(
  upload.fields([
    { name: "licenceFront", maxCount: 1 },
    { name: "licenceBack", maxCount: 1 },
    { name: "carImageFront", maxCount: 1 },
    { name: "carImageBack", maxCount: 1 },
    { name: "carImageSide", maxCount: 1 },
  ]),
  isAuthenticatedUser,
  registerDriver
);

router.route("/all").get(isAuthenticatedUser,authorizeRole('admin'), findDriver);
router.route("/id").get(isAuthenticatedUser, findOneDriver);
router
  .route("/review")
  .post(isAuthenticatedUser, createDriverReview)
  .get(isAuthenticatedUser, getDriverReviews);
router.route("/get/review/:driverId");
router
  .route("/reviews/:reviewId")
  .delete(isAuthenticatedUser, deleteDriverReview);
module.exports = router;
