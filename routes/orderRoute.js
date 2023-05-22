const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  getAllOrders,
  deleteTrip,
  payOrder,
  intializePayment,
  paymentSuccessCallback,
} = require("../controllers/orderController");

const {
  isAuthenticatedUser,
  authorizeRole,
  checkVerified,
} = require("../middlewares/auth");

router.route("/new").post(isAuthenticatedUser, checkVerified, newOrder);
router
  .route("/single/:id")
  .get(isAuthenticatedUser, checkVerified, getSingleOrder);
router.route("/all").get(isAuthenticatedUser, checkVerified, getAllOrders);
router.route("/remove").delete(isAuthenticatedUser, checkVerified, deleteTrip);
router.route("/pay/:id").post(isAuthenticatedUser, checkVerified, payOrder);
router
  .route("/initialize/:orderId")
  .get(isAuthenticatedUser, checkVerified, intializePayment);
router.route("/payment/success").get(paymentSuccessCallback);

module.exports = router;
