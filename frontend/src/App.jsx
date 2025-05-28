import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import ManagerDashboard from './components/Manager/ManagerDashboard';
import UserManagement from './components/Manager/UserManagement';
import MenuManagement from './components/Manager/MenuManagement';
import TableManagement from './components/Manager/TableManagement';
import InventorySupply from './components/Manager/InventorySupply';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/change-password" element={<ChangePassword />}/>
        <Route path="/manager-dashboard" element={<ManagerDashboard/>}>
          <Route path="user-management" element={<UserManagement />} />
          <Route path="menu-management" element={<MenuManagement />} />
          <Route path="table-management" element={<TableManagement />} />
          <Route path='inventory-supply' element={<InventorySupply />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
