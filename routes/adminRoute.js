const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  getAllTrips,
  getDailyReport,
} = require("../controllers/adminController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

// Users
router
  .route("/users")
  .get(isAuthenticatedUser, getAllUsers);
router
  .route("/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getUser)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser)
  .patch(isAuthenticatedUser, authorizeRole("admin"), updateUser);

  router.route("/summary").get(isAuthenticatedUser,authorizeRole("admin"), getDailyReport);

// Transport
router
  .route("/daily")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllTrips);

module.exports = router;
