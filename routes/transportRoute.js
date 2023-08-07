const express = require("express");
const router = express.Router();

const {
  tripUpdate,
  createTransport,
  isComplete,
  availableTrip,
  deleteTransport,
  searchTrips,
  getAllTimeDriversTrips,
  getTripById,
} = require("../controllers/transportController");

const {
  isAuthenticatedUser,
  authorizeRole,
  checkVerified,
} = require("../middlewares/auth");

router
  .route("/create")
  .post(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("driver"),
    createTransport
  );

router
  .route("/trip/update")
  .put(isAuthenticatedUser, checkVerified, authorizeRole("driver"), tripUpdate);
router
  .route("/trip/retrieve")
  .get(isAuthenticatedUser, checkVerified, getTripById);

router
  .route("/trip/complete/:id")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("driver"), isComplete);

router.route("/").get(availableTrip);
router
  .route("/driver/trips")
  .get(isAuthenticatedUser, authorizeRole("driver"), getAllTimeDriversTrips);
router.route("/search").get(searchTrips);
router
  .route("/delete/:id")
  .delete(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("driver", "admin"),
    deleteTransport
  );

module.exports = router;
