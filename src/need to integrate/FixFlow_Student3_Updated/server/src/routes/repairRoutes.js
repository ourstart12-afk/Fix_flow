const express = require("express");
const { getRepairHistory } = require("../controllers/repairController");
const router = express.Router();

router.get("/", getRepairHistory);

module.exports = router;
