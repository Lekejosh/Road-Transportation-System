const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  getAllTrips,
  getDailyReport,
  getSingleTrip,
  getAllDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  updateAdmin,
  getAdmin,
  deleteAdmin,
  createAdmin,
  createUser,
  getAllAdmin,
} = require("../controllers/adminController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

// Users
router.route('/user-create').post(isAuthenticatedUser,authorizeRole("admin"),createUser);
router.route("/users").get(isAuthenticatedUser, getAllUsers);
router
  .route("/user/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getUser)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser)
  .patch(isAuthenticatedUser, authorizeRole("admin"), updateUser);
router
  .route("/summary")
  .get(isAuthenticatedUser, authorizeRole("admin"), getDailyReport);

//Driver
router
  .route("/drivers")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllDrivers);
router
  .route("/driver/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getDriver)
  .patch(isAuthenticatedUser, authorizeRole("admin"), updateDriver)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteDriver);

//Admin
router.route("/admin/create").post(isAuthenticatedUser,authorizeRole("admin"),createAdmin)
router.route("/all/admin").get(isAuthenticatedUser,authorizeRole("admin"),getAllAdmin)
router
  .route("/admin/find/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAdmin)
  .patch(isAuthenticatedUser, authorizeRole("admin"),updateAdmin)
  .delete(isAuthenticatedUser, authorizeRole("admin"), deleteAdmin);
// Transport
router
  .route("/daily")
  .get(isAuthenticatedUser, authorizeRole("admin"), getAllTrips);
router
  .route("/trip/:id")
  .get(isAuthenticatedUser, authorizeRole("admin"), getSingleTrip);

module.exports = router;
