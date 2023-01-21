const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUser,
  deleteUser,
} = require("../controllers/userController");

const { getAllTrips } = require("../controllers/transportController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

// Users
router
  .route("/all")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllUsers);
router
  .route("/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getUser)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser)
  .patch(isAuthenticatedUser, authorizeRole("admin"), updateUser);

// Trip
router
  .route("/daily")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllTrips);

module.exports = router;
