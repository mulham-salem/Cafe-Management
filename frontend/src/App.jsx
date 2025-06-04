import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import ManagerDashboard from './components/Manager/ManagerDashboard';
import UserManagement from './components/Manager/UserManagement';
import MenuManagement from './components/Manager/MenuManagement';
import TableManagement from './components/Manager/TableManagement';
import InventorySupply from './components/Manager/InventorySupply';
import PromotionManagement from './components/Manager/PromotionManagement';
import ManagerNotification from './components/Manager/ManagerNotification';
import SupplierHome from './components/Supplier/SupplierHome';
import SupplierNotification from './components/Supplier/SupplierNotification';
import CustomerHome from './components/Customer/CustomerHome';
import CustomerNotification from './components/Customer/CustomerNotification';
import MenuAndOrder from './components/Customer/MenuAndOrder';
import UserOrder from './components/Customer/UserOrder';
import TableReservation from './components/Customer/TableReservation';
import EmployeeHome from './components/Employee/EmployeeHome';
import MenuAndOrderEmp from './components/Employee/MenuAndOrderEmp';
import UserOrderEmp from './components/Employee/UserOrderEmp';
import KitchenOrders from './components/Employee/KitchenOrders';
import EmployeeNotification from './components/Employee/EmployeeNotification';


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login/>}/>
        <Route path="/change-password" element={<ChangePassword />}/>

        <Route path="/login/manager-dashboard" element={<ManagerDashboard />}>
          <Route path="user-management" element={<UserManagement />} />
          <Route path="menu-management" element={<MenuManagement />} />
          <Route path="table-management" element={<TableManagement />} />
          <Route path='inventory-supply' element={<InventorySupply />} />
          <Route path='promotion-management' element={<PromotionManagement />} />
          <Route path='manager-notification' element={<ManagerNotification />} />
        </Route>

        <Route path="/login/supplier-home" element={<SupplierHome />}>
          <Route path='supplier-notification' element={<SupplierNotification />} />
        </Route>

        <Route path="/login/customer-home" element={<CustomerHome />}>
          <Route path="menu-order" element={<MenuAndOrder />} />
          <Route path="user-order" element={<UserOrder />} />
          <Route path="table-reservation" element={<TableReservation />} />
          <Route path="customer-notification" element={<CustomerNotification />} />
        </Route>

        <Route path="/login/employee-home" element={<EmployeeHome />}>
          <Route path="menu-order" element={<MenuAndOrderEmp />} />
          <Route path="user-order" element={<UserOrderEmp />} />
          <Route path="kitchen-order" element={<KitchenOrders />} />    
          <Route path="employee-notification" element={<EmployeeNotification />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
