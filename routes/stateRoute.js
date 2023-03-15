const express = require("express");
const router = express.Router();

const { inputStates, searchState } = require("../controllers/stateController");

router.route("/seed").post(inputStates);
router.route("/search/:state").get(searchState);


module.exports = router