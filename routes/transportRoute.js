const express = require("express");
const router = express.Router();

const {
  tripUpdate,
  createTransport,
  getTripByState,
  isComplete,
  availableTrip,
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

router.route("/all").get(availableTrip);

module.exports = router;
