import React, { useState, useEffect, useContext, useMemo } from "react";
import styles from "../styles/UserManagement.module.css";
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faShieldAlt,
  faPlus,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { SearchContext } from "./ManagerDashboard";
import { EmpSearchContext } from "../Employee/EmployeeHome";
import { usePermissions } from "../../context/PermissionsContext";

const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    username: "john2023",
    password: "P@ssw0rd123",
    role: "employee",
    permission: "Default",
  },
  {
    id: 2,
    name: "Emily Johnson",
    email: "emily.j@example.com",
    username: "emily_tech",
    password: "SecurePass!2023",
    role: "admin",
    permission: "Default",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@example.com",
    username: "mike_brown",
    password: "Mike@12345",
    role: "supplier",
    permission: "Default",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    username: "sarah_w",
    password: "Sarah#2023",
    role: "customer",
    permission: "Default",
  },
  {
    id: 5,
    name: "David Miller",
    email: "david.m@example.com",
    username: "david_m",
    password: "Dav1d$Pass",
    role: "employee",
    permission: "Default",
  },
  {
    id: 6,
    name: "Jessica Davis",
    email: "jessica.d@example.com",
    username: "jessica_d",
    password: "J3ssica!2023",
    role: "supplier",
    permission: "Default",
  },
  {
    id: 7,
    name: "Robert Taylor",
    email: "robert.t@example.com",
    username: "robert_t",
    password: "R0bert@2023",
    role: "customer",
    permission: "Default",
  },
  {
    id: 8,
    name: "Jennifer Anderson",
    email: "jennifer.a@example.com",
    username: "jennifer_a",
    password: "J3nn!fer123",
    role: "employee",
    permission: "Default",
  },
  {
    id: 9,
    name: "William Thomas",
    email: "william.t@example.com",
    username: "will_t",
    password: "W1ll@Pass2023",
    role: "admin",
    permission: "Default",
  },
  {
    id: 10,
    name: "Elizabeth Martinez",
    email: "elizabeth.m@example.com",
    username: "liz_m",
    password: "L!z2023",
    role: "supplier",
    permission: "Default",
  },
  {
    id: 11,
    name: "William Thomas",
    email: "william.t@example.com",
    username: "will_t",
    password: "W1ll@Pass2023",
    role: "admin",
    permission: "Default",
  },
  {
    id: 12,
    name: "Elizabeth Martinez",
    email: "elizabeth.m@example.com",
    username: "liz_m",
    password: "L!z2023",
    role: "supplier",
    permission: "Default",
  },
  {
    id: 13,
    name: "William Thomas",
    email: "william.t@example.com",
    username: "will_t",
    password: "W1ll@Pass2023",
    role: "admin",
    permission: "Default",
  },
  {
    id: 14,
    name: "Elizabeth Martinez",
    email: "elizabeth.m@example.com",
    username: "liz_m",
    password: "L!z2023",
    role: "supplier",
    permission: "Default",
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showInputs, setShowInputs] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [isAssigningPermissions, setIsAssigningPermissions] = useState(false);
  const [userToAssign, setUserToAssign] = useState(null);
  const [loading, setLoading] = useState(true);
  const { permissions, role } = usePermissions();

  const allPermissions = [
    "User Management",
    "Menu Management",
    "Inventory Management",
    "Supply Management",
    "Promotion Management",
    "Report Dashboard",
  ];

  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  useEffect(() => {
    document.title = "Cafe Delights - User Management";
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // const res = await axiosInstance.get("/manager/users");
      // const formattedUsers = res.data.map((u) => ({
      //   ...u,
      //   permission: Array.isArray(u.permissions) ? u.permissions : [],
      // }));
      // setUsers(formattedUsers);
      setUsers(mockUsers);
    } catch (error) {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });

    if (name === "role") {
      if (value === "employee" || value === "supplier") {
        setShowPermissionPopup(true);
        setSelectedPermissions([]);
      } else {
        setShowPermissionPopup(false);
        setSelectedPermissions([]);
      }
    }
  };

  const handleCheckboxChange = (perm) => {
    let updated;
    if (selectedPermissions.includes(perm)) {
      updated = selectedPermissions.filter((p) => p !== perm);
    } else {
      if (selectedPermissions.length >= 3) return;
      updated = [...selectedPermissions, perm];
    }
    setSelectedPermissions(updated);
  };

  const handleAddUser = async () => {
    const { name, email, username, password, role } = newUser;
    if (!name || !email || !username || !password || !role) {
      toast.error("Please fill in all fields.");
      return;
    }

    let permissions = [];
    if (role === "employee") {
      permissions = selectedPermissions;
    } else if (role === "supplier") {
      permissions = selectedPermissions.includes("Inventory Management")
        ? ["Inventory Management"]
        : [];
    } else if (role === "customer") {
      permissions = ["Default"];
    }

    try {
      const res = await axiosInstance.post("/manager/users", {
        name,
        email,
        username,
        password,
        role,
        permissions,
      });

      const newUserFromServer = {
        ...res.data.user,
        permission: res.data.permissions,
      };

      setUsers((prev) => [...prev, newUserFromServer]);
      toast.success(res.data.message || "User created successfully.");
      setShowInputs(false);
      setShowPermissionPopup(false);
      setSelectedPermissions([]);
      setNewUser({ name: "", email: "", username: "", password: "", role: "" });
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach(([msg]) =>
          toast.error(msg)
        );
      } else {
        toast.error("Failed to create user.");
      }
    }
  };

  const handleCancelEdit = () => {
    if (showPermissionPopup) {
      setShowPermissionPopup(false);
      if (isAssigningPermissions) {
        setUserToAssign(null);
        setSelectedPermissions([]);
        setIsAssigningPermissions(false);
      }
      return;
    }

    setEditUserId(null);
    setEditedUser({});
    setSelectedPermissions([]);

    setShowInputs(false);
    setNewUser({ name: "", email: "", username: "", password: "", role: "" });

    setUserToAssign(null);
    setIsAssigningPermissions(false);
  };

  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditedUser({ ...user, password: "" });
    const initialPermissions = Array.isArray(user.permission)
      ? user.permission
      : user.permission === "Default"
      ? []
      : [user.permission];
    setSelectedPermissions(initialPermissions);
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });

    if (name === "role") {
      if (value === "employee" || value === "supplier") {
        setShowPermissionPopup(true);
        setSelectedPermissions([]);
      } else {
        setShowPermissionPopup(false);
        setSelectedPermissions([]);
      }
    }
  };

  const handleSaveEdit = async () => {
    const { id, name, email, username, password, role } = editedUser;
    if (!name || !email || !username || !role) {
      toast.error("Please fill in all fields.");
      return;
    }

    let permissions = [];
    if (role === "employee") {
      permissions =
        selectedPermissions.length === 0 ? ["Default"] : selectedPermissions;
    } else if (role === "supplier") {
      permissions = selectedPermissions.includes("Inventory Management")
        ? ["Inventory Management"]
        : ["Default"];
    } else if (role === "customer") {
      permissions = ["Default"];
    }

    try {
      const res = await axiosInstance.put(`/manager/users/${id}`, {
        name,
        email,
        username,
        password: password || undefined,
        role,
        permissions,
      });

      const updatedUser = {
        ...res.data.user,
        permission: res.data.permissions,
      };

      setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
      toast.success(res.data.message || "User updated successfully.");
      setEditUserId(null);
      setEditedUser({});
      setSelectedPermissions([]);
      setShowPermissionPopup(false);
    } catch (err) {
      toast.error("Failed to update user.");
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await axiosInstance.delete(`/manager/users/${user.id}`);
      setUsers(users.filter((u) => u.id !== user.id));
      toast.success("User deleted successfully.");
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleAssignPermissionsClick = (user) => {
    setUserToAssign(user);
    const initialPermissions = Array.isArray(user.permission)
      ? user.permission
      : user.permission === "Default"
      ? []
      : [user.permission];
    setSelectedPermissions(initialPermissions);
    setShowPermissionPopup(true);
    setIsAssigningPermissions(true);
  };

  const currentRole = showInputs
    ? newUser.role
    : isAssigningPermissions && userToAssign
    ? userToAssign.role
    : editedUser.role;

  const handleSaveAssign = async () => {
    if (!userToAssign) return;
    try {
      let permissionsToSend = [];

      if (userToAssign.role === "employee") {
        permissionsToSend =
          selectedPermissions.length === 0 ? ["Default"] : selectedPermissions;
      } else if (userToAssign.role === "supplier") {
        permissionsToSend = selectedPermissions.includes("Inventory Management")
          ? ["Inventory Management"]
          : ["Default"];
      } else if (userToAssign.role === "customer") {
        permissionsToSend = ["Default"];
      }

      const res = await axiosInstance.put(`/manager/users/${userToAssign.id}`, {
        name: userToAssign.name,
        email: userToAssign.email,
        username: userToAssign.username,
        password: undefined,
        role: userToAssign.role,
        permissions: permissionsToSend,
      });

      const updatedUser = {
        ...res.data.user,
        permission: res.data.permissions,
      };

      setUsers(users.map((u) => (u.id === userToAssign.id ? updatedUser : u)));
      toast.success("Permissions updated successfully.");
    } catch {
      toast.error("Failed to update permissions.");
    }

    setShowPermissionPopup(false);
    setUserToAssign(null);
    setSelectedPermissions([]);
    setIsAssigningPermissions(false);
  };

  const showDeleteConfirmation = (user) => {
    toast.info(
      ({ closeToast }) => (
        <div className="custom-toast">
          <p>
            Are you sure you want to delete <strong>{user.name}</strong>?
          </p>
          <div className="toast-buttons">
            <button
              onClick={() => {
                handleDeleteUser(user);
                closeToast();
              }}
            >
              Yes
            </button>
            <button onClick={closeToast}>Cancel</button>
          </div>
        </div>
      ),
      {
        toastId: `delete-user-${user.id}`,
        position: "top-center",
        closeButton: false,
        autoClose: false,
        draggable: false,
        icon: false,
        className: "custom-toast-container",
        bodyClassName: "custom-toast-body",
      }
    );
  };

  const managerContext = useContext(SearchContext);
  const empContext = useContext(EmpSearchContext);
  const context = role === "manager" ? managerContext : empContext;
  const { searchQuery, setSearchPlaceholder } = context;


  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  useEffect(() => {
    setSearchPlaceholder("Search by user name...");
  }, [setSearchPlaceholder]);

  return (
    <div
      className={`userContainer ${
        showInputs ? styles.open : styles.close
      }`}
    >
      <ToastContainer />
      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : (
        <>
          {!showInputs && filteredUsers.length > 0 && (
            <button
              className="createButton"
              onClick={() => setShowInputs(true)}
            >
              <FontAwesomeIcon icon={faPlus} className={styles.icon} />
              Create New User
            </button>
          )}

          {filteredUsers.length === 0 ? (
            <p className={styles.noResults}>
              {searchQuery
                ? `No user match "${searchQuery}"`
                : "No users available"}
            </p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Permission</th>
                  <th>Operations</th>
                </tr>
              </thead>
              <tbody>
                {showInputs && (
                  <tr>
                    <td className={styles.dash}>—</td>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={newUser.name}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="username"
                        value={newUser.username}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    </td>
                    <td className={styles.selectCell}>
                      <select
                        name="role"
                        value={newUser.role}
                        onChange={handleInputChange}
                        className={styles.selectBox}
                      >
                        <option value="">Select Role</option>
                        <option value="customer">Customer</option>
                        <option value="employee">Employee</option>
                        <option value="supplier">Supplier</option>
                      </select>
                    </td>
                    <td className={styles.dash}>—</td>
                    <td className={styles.actions}>
                      <div className={styles.actionWrapper}>
                        <FontAwesomeIcon
                          icon={faCheck}
                          className={styles.actionIcon}
                          onClick={handleAddUser}
                          data-action="Add"
                          title="Add"
                        />
                        <FontAwesomeIcon
                          icon={faTimes}
                          className={styles.actionIcon}
                          onClick={handleCancelEdit}
                          data-action="Cancel"
                          title="Cancel"
                        />
                      </div>
                    </td>
                  </tr>
                )}

                {filteredUsers.map((user) =>
                  editUserId === user.id ? (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <input
                          name="name"
                          value={editedUser.name}
                          onChange={handleInputEditChange}
                          className={styles.input}
                        />
                      </td>
                      <td>
                        <input
                          name="email"
                          value={editedUser.email}
                          onChange={handleInputEditChange}
                          className={styles.input}
                        />
                      </td>
                      <td>
                        <input
                          name="username"
                          value={editedUser.username}
                          onChange={handleInputEditChange}
                          className={styles.input}
                        />
                      </td>
                      <td>
                        <input
                          type="password"
                          name="password"
                          value={editedUser.password || ""}
                          onChange={handleInputEditChange}
                          className={styles.input}
                          placeholder="Leave blank to keep current"
                        />
                      </td>
                      <td>
                        <select
                          name="role"
                          value={editedUser.role}
                          onChange={handleInputEditChange}
                          className={styles.selectBox}
                        >
                          <option value="customer">Customer</option>
                          <option value="employee">Employee</option>
                          <option value="supplier">Supplier</option>
                        </select>
                      </td>
                      <td>
                        {Array.isArray(editedUser.permission)
                          ? editedUser.permission.join(", ")
                          : editedUser.permission || "—"}
                      </td>
                      <td className={styles.actions}>
                        <div className={styles.actionWrapper}>
                          <FontAwesomeIcon
                            icon={faCheck}
                            className={styles.actionIcon}
                            onClick={handleSaveEdit}
                            data-action="Save"
                            title="Save"
                          />
                          <FontAwesomeIcon
                            icon={faTimes}
                            className={styles.actionIcon}
                            onClick={handleCancelEdit}
                            data-action="Cancel"
                            title="Cancel"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.username}</td>
                      <td>••••••••</td>
                      <td>{user.role}</td>
                      <td>
                        {Array.isArray(user.permission)
                          ? user.permission.join(", ")
                          : user.permission || "—"}
                      </td>
                      <td className={styles.actions}>
                        <FontAwesomeIcon
                          icon={faEdit}
                          className={styles.actionIcon}
                          onClick={() => handleEditClick(user)}
                          data-action="Edit"
                          title="Edit"
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className={styles.actionIcon}
                          onClick={() => showDeleteConfirmation(user)}
                          data-action="Delete"
                          title="Delete"
                        />
                        <FontAwesomeIcon
                          icon={faShieldAlt}
                          className={styles.actionIcon}
                          data-action="Assign Roles"
                          title="Assign Roles"
                          onClick={() => handleAssignPermissionsClick(user)}
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </>
      )}
      {showPermissionPopup && <div className={styles.overlay}></div>}
      {showPermissionPopup && (
        <div className={styles.permissionPopup}>
          <h4>Assign Permissions</h4>
          <div className={styles.checkboxList}>
            {currentRole === "employee" &&
              allPermissions.map((perm) => (
                <label key={perm}>
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => handleCheckboxChange(perm)}
                    disabled={
                      selectedPermissions.length >= 3 &&
                      !selectedPermissions.includes(perm)
                    }
                  />
                  {perm}
                </label>
              ))}

            {currentRole === "supplier" && (
              <>
                <label>
                  <input
                    type="radio"
                    name="supplierPerm"
                    checked={selectedPermissions.includes("Default")}
                    onChange={() => setSelectedPermissions(["Default"])}
                  />
                  Default
                </label>
                <label>
                  <input
                    type="radio"
                    name="supplierPerm"
                    checked={selectedPermissions.includes(
                      "Inventory Management"
                    )}
                    onChange={() =>
                      setSelectedPermissions(["Inventory Management"])
                    }
                  />
                  Inventory Management
                </label>
              </>
            )}
          </div>

          {isAssigningPermissions && (
            <div className={styles.modalActions}>
              <FontAwesomeIcon
                icon={faCheck}
                className={styles.icon}
                onClick={handleSaveAssign}
                data-action="Save"
                title="Save"
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={styles.icon}
                onClick={handleCancelEdit}
                data-action="Cancel"
                title="Cancel"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default UserManagement;
