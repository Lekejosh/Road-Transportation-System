const express = require('express')
const router = express.Router()

const {
  tripUpdate,
  createTransport,
  getTripByState,
  getAllTrips,
} = require("../controllers/transportController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router
  .route("/create")
  .put(isAuthenticatedUser,authorizeRole("driver"), createTransport);

router
  .route("/trip/update")
  .put(isAuthenticatedUser, authorizeRole("driver"), tripUpdate);
router.route("/all").get(isAuthenticatedUser, getTripByState);

router.route("/admin/all").get(isAuthenticatedUser,getAllTrips)
module.exports = router