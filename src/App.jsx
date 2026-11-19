import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import ManagerLayout from './layouts/ManagerLayout.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import Profile from './pages/Profile.jsx'; // Student 4 profile import amendment
import Settings from './pages/Settings.jsx'; // Student 4 settings import amendment
import ManagerDashboard from './pages/ManagerDashboard.jsx'; // Student 4 manager dashboard import amendment
import ManagerRequests from './pages/ManagerRequests.jsx'; // Student 4 manager requests import amendment

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding/1" replace />} />

      <Route path="/onboarding/:step" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Customer Layout: Sidebar remains permanently visible across all customer views */}
      <Route element={<CustomerLayout />}>
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/new-repair" element={<PlaceholderPage title="New repair" owner="Student 2" />} />
        <Route path="/track" element={<PlaceholderPage title="Track a request" owner="Student 2" />} />
        <Route path="/requests/:id" element={<PlaceholderPage title="Request details" owner="Student 2" />} />
        <Route path="/help" element={<PlaceholderPage title="Repair help" owner="Student 2" />} />
        <Route path="/devices" element={<PlaceholderPage title="My devices" owner="Student 3" />} />
        <Route path="/devices/new" element={<PlaceholderPage title="Add a device" owner="Student 3" />} />
        <Route path="/devices/:id/edit" element={<PlaceholderPage title="Edit device" owner="Student 3" />} />
        <Route path="/devices/:id" element={<PlaceholderPage title="Device details" owner="Student 3" />} />
        <Route path="/history" element={<PlaceholderPage title="Repair history" owner="Student 3" />} />
        <Route path="/profile" element={<Profile />} /> {/* Student 4 profile route amendment */}
        <Route path="/settings" element={<Settings />} /> {/* Student 4 settings route amendment */}
      </Route>

      {/* Manager Layout: Sidebar and protected analytics workspace for facility managers */}
      <Route element={<ManagerLayout />}>
        <Route path="/manager/dashboard" element={<ManagerDashboard />} /> {/* Student 4 manager dashboard route amendment */}
        <Route path="/manager/requests" element={<ManagerRequests />} /> {/* Student 4 manager requests list route amendment */}
        <Route path="/manager/requests/:id" element={<PlaceholderPage title="Manager request details" owner="Student 4" />} /> {/* Student 4 manager request details route amendment */}
        <Route path="/manager/profile" element={<Profile />} /> {/* Student 4 manager profile route amendment */}
        <Route path="/manager/settings" element={<Settings />} /> {/* Student 4 manager settings route amendment */}
      </Route>

      <Route path="*" element={<PlaceholderPage title="Page not found" owner="FixFlow" />} />
    </Routes>
  );
}

export default App;