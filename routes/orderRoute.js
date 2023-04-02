const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  getAllOrders,
  deleteTrip,
  payOrder,
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router.route("/new").post(isAuthenticatedUser, newOrder);
router.route("/single/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/all").get(isAuthenticatedUser, getAllOrders);
router.route("/remove").delete(isAuthenticatedUser, deleteTrip);
router.route("/pay/:id").post(isAuthenticatedUser, payOrder);

module.exports = router;
