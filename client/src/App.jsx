import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Contracts from './pages/contracts/Contracts';
import ContractCreate from './pages/contracts/ContractCreate';
import ContractDetails from './pages/contracts/ContractDetails';
import Vendors from './pages/vendors/Vendors';
import VendorDetails from './pages/vendors/VendorDetails';
import VendorDashboard from './pages/vendor/VendorDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import ContractEdit from './pages/contracts/ContractEdit';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contracts/new" element={<ContractCreate />} />
          <Route path="/contracts/:id" element={<ContractDetails />} />
          <Route path="/contracts/:id/edit" element={<ContractEdit />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:id" element={<VendorDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
