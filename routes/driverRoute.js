const express = require("express");
const router = express.Router();

const {
  registerDriver,
  findDriver,
  findOneDriver,
  createDriverReview,
} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router.route("/register").put(isAuthenticatedUser, registerDriver);
router.route("/all").get(isAuthenticatedUser, findDriver);
router.route("/id").get(isAuthenticatedUser, findOneDriver);
router.route("/review").post(isAuthenticatedUser, createDriverReview);

module.exports = router;
