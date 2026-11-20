const { devices } = require("../data/sampleData");

// GET /api/devices - return all saved devices
const getDevices = (req, res) => {
  res.status(200).json({
    success: true,
    count: devices.length,
    data: devices,
  });
};

// POST /api/devices - add a device
const addDevice = (req, res) => {
  const { type, brand, model, serial, nickname } = req.body;

  const missingFields = [];
  if (!type || !String(type).trim()) missingFields.push("type");
  if (!brand || !String(brand).trim()) missingFields.push("brand");
  if (!model || !String(model).trim()) missingFields.push("model");

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
      missingFields,
    });
  }

  const newDevice = {
    id: String(Date.now()),
    type: String(type).trim(),
    brand: String(brand).trim(),
    model: String(model).trim(),
    serial: serial ? String(serial).trim() : "",
    nickname: nickname ? String(nickname).trim() : "",
    createdAt: new Date().toISOString(),
  };

  devices.push(newDevice);

  return res.status(201).json({
    success: true,
    message: "Device added successfully",
    data: newDevice,
  });
};

// PUT /api/devices/:id - update an existing device
const updateDevice = (req, res) => {
  const { id } = req.params;
  const deviceIndex = devices.findIndex((device) => device.id === id);

  if (deviceIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Device not found",
    });
  }

  const { type, brand, model, serial, nickname } = req.body;
  const currentDevice = devices[deviceIndex];

  const updatedDevice = {
    ...currentDevice,
    type: type !== undefined ? String(type).trim() : currentDevice.type,
    brand: brand !== undefined ? String(brand).trim() : currentDevice.brand,
    model: model !== undefined ? String(model).trim() : currentDevice.model,
    serial: serial !== undefined ? String(serial).trim() : currentDevice.serial,
    nickname: nickname !== undefined ? String(nickname).trim() : currentDevice.nickname,
    updatedAt: new Date().toISOString(),
  };

  if (!updatedDevice.type || !updatedDevice.brand || !updatedDevice.model) {
    return res.status(400).json({
      success: false,
      message: "Type, brand, and model are required",
    });
  }

  devices[deviceIndex] = updatedDevice;

  return res.status(200).json({
    success: true,
    message: "Device updated successfully",
    data: updatedDevice,
  });
};

module.exports = {
  getDevices,
  addDevice,
  updateDevice,
};
