const express = require("express");
const router = express.Router();

const {
  registerDriver,
  findDriver,
  findOneDriver,
} = require("../controllers/userController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router.route("/register").put(isAuthenticatedUser, registerDriver);
router.route("/all").get(isAuthenticatedUser, findDriver);
router.route("/id").get(isAuthenticatedUser, findOneDriver);

module.exports = router;
