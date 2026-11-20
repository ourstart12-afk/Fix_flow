const { repairRequests } = require("../data/sampleData");

// GET /api/repairs?status=Completed&search=REQ-1001&deviceId=...
const getRepairHistory = (req, res) => {
  const { status, search, deviceId } = req.query;
  let results = [...repairRequests];

  if (status && status !== "All statuses") {
    results = results.filter((item) =>
      item.status.toLowerCase() === String(status).toLowerCase()
    );
  }
  if (search) {
    const term = String(search).toLowerCase();
    results = results.filter((item) =>
      item.id.toLowerCase().includes(term) ||
      item.device.toLowerCase().includes(term)
    );
  }
  if (deviceId) {
    results = results.filter((item) => String(item.deviceId) === String(deviceId));
  }

  res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
};

module.exports = { getRepairHistory };
