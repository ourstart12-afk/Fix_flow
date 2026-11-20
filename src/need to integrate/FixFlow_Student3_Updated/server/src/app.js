const express = require("express");
const cors = require("cors");
const deviceRoutes = require("./routes/deviceRoutes");\nconst repairRoutes = require("./routes/repairRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to FixFlow API",
  });
});

app.use("/api/devices", deviceRoutes);\napp.use("/api/repairs", repairRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
});

module.exports = app;
