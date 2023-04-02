const express = require("express");
const router = express.Router();

const { inputStates, searchState, getAll } = require("../controllers/stateController");

router.route("/seed").post(inputStates);
router.route("/search/:state").get(searchState);
router.route("/").get(getAll)


module.exports = router