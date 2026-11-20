import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import MyDevices from "./pages/MyDevices";
import AddDevice from "./pages/AddDevice";
import DeviceDetails from "./pages/DeviceDetails";
import EditDevice from "./pages/EditDevice";
import RepairHistory from "./pages/RepairHistory";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(v => v + 1);
  return <BrowserRouter><Layout><Routes>
    <Route path="/" element={<Navigate to="/devices" replace />} />
    <Route path="/devices" element={<MyDevices refreshKey={refreshKey} />} />
    <Route path="/devices/new" element={<AddDevice onSaved={refresh} />} />
    <Route path="/devices/:id" element={<DeviceDetails />} />
    <Route path="/devices/:id/edit" element={<EditDevice onSaved={refresh} />} />
    <Route path="/history" element={<RepairHistory />} />
    <Route path="*" element={<Navigate to="/devices" replace />} />
  </Routes></Layout></BrowserRouter>;
}
