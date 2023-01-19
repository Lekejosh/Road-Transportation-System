const express = require('express')
const router = express.Router()

const {
  tripUpdate,
  createTransport,
} = require("../controllers/transportController");

const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");

router
  .route("/create")
  .put(isAuthenticatedUser, authorizeRole("driver"), createTransport);

router
  .route("/trip/update")
  .put(isAuthenticatedUser, authorizeRole("driver"), tripUpdate);

module.exports = router