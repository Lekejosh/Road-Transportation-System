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

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router
  .route("/create")
  .post(isAuthenticatedUser, authorizeRole("driver"), createTransport);

router
  .route("/trip/update")
  .put(isAuthenticatedUser, authorizeRole("driver"), tripUpdate);
router.route("/state").get(isAuthenticatedUser, getTripByState);
router
  .route("/trip/complete/:id")
  .get(isAuthenticatedUser, authorizeRole("driver"), isComplete);

router.route("/").get(availableTrip)
router.route("/search").get(searchTrips)
router
  .route("/delete/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRole("driver", "admin"),
    deleteTransport
  );

module.exports = router;
