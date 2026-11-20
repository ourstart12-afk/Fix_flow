const express = require("express");
const {
  getDevices,
  addDevice,
  updateDevice,
} = require("../controllers/deviceController");

const router = express.Router();

router.get("/", getDevices);
router.post("/", addDevice);
router.put("/:id", updateDevice);

module.exports = router;
