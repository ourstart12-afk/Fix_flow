import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import ManagerLayout from './layouts/ManagerLayout.jsx';

// Auth & onboarding
import Onboarding from './pages/Onboarding.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ManagerLogin from './pages/ManagerLogin.jsx';

// Customer pages — Student 1 & 4
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

// Student 2 — Repair submission & tracking
import NewRepair from './pages/NewRepair.jsx';
import Track from './pages/Track.jsx';
import RequestDetails from './pages/RequestDetails.jsx';
import Help from './pages/Help.jsx';

// Student 3 — Device inventory & history
import MyDevices from './pages/MyDevices.jsx';
import AddDevice from './pages/AddDevice.jsx';
import DeviceDetails from './pages/DeviceDetails.jsx';
import EditDevice from './pages/EditDevice.jsx';
import RepairHistory from './pages/RepairHistory.jsx';

// Manager pages — Student 4
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import ManagerRequests from './pages/ManagerRequests.jsx';
import ManagerRequestDetails from './pages/ManagerRequestDetails.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding/1" replace />} />

      <Route path="/onboarding/:step" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/manager/login" element={<ManagerLogin />} />

      {/* Customer Layout */}
      <Route element={<CustomerLayout />}>
        <Route path="/dashboard" element={<CustomerDashboard />} />

        {/* Student 2 — Repair */}
        <Route path="/new-repair" element={<NewRepair />} />
        <Route path="/track" element={<Track />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
        <Route path="/help" element={<Help />} />

        {/* Student 3 — Devices */}
        <Route path="/devices" element={<MyDevices />} />
        <Route path="/devices/new" element={<AddDevice />} />
        <Route path="/devices/:id/edit" element={<EditDevice />} />
        <Route path="/devices/:id" element={<DeviceDetails />} />
        <Route path="/history" element={<RepairHistory />} />

        {/* Student 4 — Account */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Manager Layout */}
      <Route element={<ManagerLayout />}>
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/requests" element={<ManagerRequests />} />
        <Route path="/manager/requests/:id" element={<ManagerRequestDetails />} />
        <Route path="/manager/profile" element={<Profile />} />
        <Route path="/manager/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<PlaceholderPage title="Page not found" owner="FixFlow" />} />
    </Routes>
  );
}

export default App;
