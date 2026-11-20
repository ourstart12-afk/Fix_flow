// In-memory development data. Records reset when the server restarts.
const devices = [];
const repairRequests = [
  {
    id: "REQ-1001",
    deviceId: "demo-device-1",
    device: "Dell Inspiron 15",
    date: "2026-11-10",
    status: "Completed"
  },
  {
    id: "REQ-1002",
    deviceId: "demo-device-1",
    device: "Dell Inspiron 15",
    date: "2026-11-14",
    status: "In Repair"
  }
];
module.exports = { devices, repairRequests };
