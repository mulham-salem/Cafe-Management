import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import ChangePassword from "./components/ChangePassword";
import ResetPasswordWizard from "./components/ResetPasswordWizard";
import MyAccount from "./components/MyAccount";
import InternalMessage from "./components/InternalMessage";

import ManagerDashboard from "./components/Manager/ManagerDashboard";
import UserManagement from "./components/Manager/UserManagement";
import MenuManagement from "./components/Manager/MenuManagement";
import InventorySupply from "./components/Manager/InventorySupply";
import PromotionManagement from "./components/Manager/PromotionManagement";
import ManagerNotification from "./components/Manager/ManagerNotification";
import ReportsDashboard from "./components/Manager/ReportsDashboard";
import SalesReport from "./components/Manager/Report/SalesReport";
import FinanceReport from "./components/Manager/Report/FinanceReport";

import SupplierHome from "./components/Supplier/SupplierHome";
import SupplierNotification from "./components/Supplier/SupplierNotification";

import CustomerHome from "./components/Customer/CustomerHome";
import CustomerNotification from "./components/Customer/CustomerNotification";

import MenuAndOrder from "./components/Customer/MenuAndOrder";
import UserOrder from "./components/Customer/UserOrder";
import TableReservation from "./components/Customer/TableReservation";

import EmployeeHome from "./components/Employee/EmployeeHome";
import MenuAndOrderEmp from "./components/Employee/MenuAndOrderEmp";
import UserOrderEmp from "./components/Employee/UserOrderEmp";
import KitchenOrders from "./components/Employee/KitchenOrders";
import TableManagement from "./components/Employee/TableManagement";
import EmployeeNotification from "./components/Employee/EmployeeNotification";

import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGuard from "./components/PermissionGuard";

import { OrderNotificationProvider } from "./context/OrderNotificationProvider";
import { ActiveTabProvider } from "./context/ActiveTabContext";
import { PermissionsProvider } from "./context/PermissionsContext";

function App() {
  return (
    <>
      <ToastContainer theme="dark"/>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/change-password"
            element={
              //<ProtectedRoute>
              <ChangePassword />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/login/reset-password"
            element={<ResetPasswordWizard />}
          />

          <Route
            path="/login/manager-dashboard"
            element={
              //<ProtectedRoute>
              <ActiveTabProvider>
                <PermissionsProvider>
                  <ManagerDashboard />
                </PermissionsProvider>
              </ActiveTabProvider>
              //</ProtectedRoute>
            }
          >
            <Route path="user-management" element={<UserManagement />} />
            <Route path="menu-management" element={<MenuManagement />} />
            <Route path="inventory-supply" element={<InventorySupply />} />
            <Route
              path="promotion-management"
              element={<PromotionManagement />}
            />
            <Route path="reports-dashboard" element={<ReportsDashboard />}>
              <Route path="sales-report" element={<SalesReport />} />
              <Route path="finance-report" element={<FinanceReport />} />
            </Route>

            <Route element={<PermissionGuard requiredRoles={["manager"]} />}>
              <Route path="my-account" element={<MyAccount />} />
              <Route path="message" element={<InternalMessage />} />
            </Route>

            <Route
              path="manager-notification"
              element={<ManagerNotification />}
            />
          </Route>

          <Route
            path="/login/supplier-home"
            element={
              //<ProtectedRoute>
              <ActiveTabProvider>
                <PermissionsProvider>
                  <SupplierHome />
                </PermissionsProvider>
              </ActiveTabProvider>
              //</ProtectedRoute>
            }
          >
            <Route path="my-account" element={<MyAccount />} />
            <Route path="message" element={<InternalMessage />} />
            <Route
              path="supplier-notification"
              element={<SupplierNotification />}
            />

            <Route
              element={
                <PermissionGuard
                  requiredPermissions={["Inventory Management"]}
                  requiredRoles={["supplier"]}
                />
              }
            >
              <Route path="inventory-supply" element={<InventorySupply />} />
              <Route
                path="manager-notification"
                element={<ManagerNotification />}
              />
            </Route>
          </Route>

          <Route
            path="/login/customer-home"
            element={
              // <ProtectedRoute>
              <OrderNotificationProvider>
                <CustomerHome />
              </OrderNotificationProvider>
              // </ProtectedRoute>
            }
          >
            <Route path="menu-order" element={<MenuAndOrder />} />
            <Route path="user-order" element={<UserOrder />} />
            <Route path="table-reservation" element={<TableReservation />} />
            <Route path="my-account" element={<MyAccount />} />
            <Route
              path="customer-notification"
              element={<CustomerNotification />}
            />
          </Route>

          <Route
            path="/login/employee-home"
            element={
              //<ProtectedRoute>
              <ActiveTabProvider>
                <PermissionsProvider>
                  <EmployeeHome />
                </PermissionsProvider>
              </ActiveTabProvider>
              //</ProtectedRoute>
            }
          >
            <Route path="menu-order" element={<MenuAndOrderEmp />} />
            <Route path="user-order" element={<UserOrderEmp />} />
            <Route path="kitchen-order" element={<KitchenOrders />} />
            <Route path="table-management" element={<TableManagement />} />
            <Route
              path="employee-notification"
              element={<EmployeeNotification />}
            />
            <Route path="my-account" element={<MyAccount />} />
            <Route path="message" element={<InternalMessage />} />
            <Route
              element={
                <PermissionGuard
                  requiredPermissions={["User Management"]}
                  requiredRoles={["employee"]}
                />
              }
            >
              <Route path="user-management" element={<UserManagement />} />
            </Route>
            <Route
              element={
                <PermissionGuard
                  requiredPermissions={["Menu Management"]}
                  requiredRoles={["employee"]}
                />
              }
            >
              <Route path="menu-management" element={<MenuManagement />} />
            </Route>
            <Route
              element={
                <PermissionGuard
                  requiredPermissions={["Promotion Management"]}
                  requiredRoles={["employee"]}
                />
              }
            >
              <Route
                path="promotion-management"
                element={<PromotionManagement />}
              />
            </Route>
            <Route
              element={
                <PermissionGuard
                  requiredPermissions={["Report Dashboard"]}
                  requiredRoles={["employee"]}
                />
              }
            >
              <Route path="reports-dashboard" element={<ReportsDashboard />}>
                <Route path="sales-report" element={<SalesReport />} />
                <Route path="finance-report" element={<FinanceReport />} />
              </Route>
            </Route>
            <Route
              element={
                <PermissionGuard
                  requiredPermissions={[
                    "Inventory Management",
                    "Supply Management",
                  ]}
                  permissionMode="OR"
                  requiredRoles={["employee"]}
                />
              }
            >
              <Route path="inventory-supply" element={<InventorySupply />} />
              <Route
                path="manager-notification"
                element={<ManagerNotification />}
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
