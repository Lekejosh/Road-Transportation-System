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

const { isAuthenticatedUser,checkVerified, authorizeRole } = require("../middlewares/auth");

// Users
router
  .route("/user-create")
  .post(isAuthenticatedUser, checkVerified, authorizeRole("admin"), createUser);
router
  .route("/users")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("admin"), getAllUsers);
router
  .route("/user/:id")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("admin"), getUser)
  .delete(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    deleteUser
  )
  .patch(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    updateUser
  );

//Driver
router
  .route("/drivers")
  .get(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    getAllDrivers
  );
router
  .route("/driver/:id")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("admin"), getDriver)
  .patch(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    updateDriver
  )
  .delete(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    deleteDriver
  );

//Admin
router
  .route("/create")
  .post(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    createAdmin
  );
router
  .route("/all/admin")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("admin"), getAllAdmin);
router
  .route("/admin/find/:id")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("admin"), getAdmin)
  .patch(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    updateAdmin
  )
  .delete(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    deleteAdmin
  );
// Transport
router
  .route("/daily")
  .get(isAuthenticatedUser, checkVerified, authorizeRole("admin"), getAllTrips);
router
  .route("/trip/:id")
  .get(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    getSingleTrip
  );
router
  .route("/summary")
  .get(
    isAuthenticatedUser,
    checkVerified,
    authorizeRole("admin"),
    getDailyReport
  );
module.exports = router;
