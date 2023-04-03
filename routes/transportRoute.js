const express = require("express");
const router = express.Router();

const {
  tripUpdate,
  createTransport,
  getTripByState,
  isComplete,
  availableTrip,
  deleteTransport,
  searchTrips,
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
    checkVerified,authorizeRole("driver"),
    createTransport
  );

router
  .route("/trip/update")
  .put(isAuthenticatedUser,checkVerified, authorizeRole("driver"), tripUpdate);
router.route("/state").get(isAuthenticatedUser,checkVerified, getTripByState);
router
  .route("/trip/complete/:id")
  .get(isAuthenticatedUser,checkVerified, authorizeRole("driver"), isComplete);

router.route("/").get(availableTrip)
router.route("/search").get(searchTrips)
router
  .route("/delete/:id")
  .delete(
    isAuthenticatedUser,checkVerified,
    authorizeRole("driver", "admin"),
    deleteTransport
  );

module.exports = router;
