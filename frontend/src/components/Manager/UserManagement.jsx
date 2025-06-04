import React, { useState, useEffect } from "react";
import styles from "../styles/UserManagement.module.css";
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faShieldAlt, faPlus, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserManagement = () => {

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("users");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [showInputs, setShowInputs] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "",
    permission: "Default",
  });

  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});

  const allPermissions = [
    "User Management",
    "Menu Management",
    "Table Management",
    "Inventory & Supply",
    "Promotions Management",
    "Manager's Notifications",
  ];

  useEffect(() => {
    document.title = "Cafe Delights - User Management";
  }, []);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });

    if (name === "role") {
      if (value === "Employee" || value === "Supplier") {
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

  const handleAddUser = () => {
    const { name, email, username, password, role } = newUser;
    if (!name || !email || !username || !password || !role) {
      toast.error("Please fill in all fields.");
      setShowPermissionPopup(false);
      return;
    }
    let finalPermission = "Default";
    if (role === "Employee") {
      finalPermission = selectedPermissions.length === 0 ? "Default" : selectedPermissions;
    } else if (role === "Supplier") {
      finalPermission = selectedPermissions.includes("Inventory & Supply") ? "Inventory & Supply" : "Default";
    }

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const addedUser = { ...newUser, id: newId, permission: finalPermission };

    setUsers([...users, addedUser]);
    setShowInputs(false);
    setShowPermissionPopup(false);
    setNewUser({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "",
      permission: "Default",
    });
    setSelectedPermissions([]);
    toast.success("User added successfully!");
  };

  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditedUser({ ...user });
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  
    if (name === "role") {
      if (value === "Employee" || value === "Supplier") {
        setShowPermissionPopup(true);
        setSelectedPermissions([]);
      } else {
        setShowPermissionPopup(false);
        setSelectedPermissions([]);
      }
    }
  };
  

  const handleSaveEdit = () => {
    const { name, email, username, password, role } = editedUser;
    if (!name || !email || !username || !password || !role) {
      toast.error("Please fill in all fields.");
      setShowPermissionPopup(false);
      return;
    }
    let finalPermission = "Default";
    if (editedUser.role === "Employee") {
      finalPermission = selectedPermissions.length === 0 ? "Default" : selectedPermissions;
    } else if (editedUser.role === "Supplier") {
      finalPermission = selectedPermissions.includes("Inventory & Supply") ? "Inventory & Supply" : "Default";
    }
    const updatedUser = { ...editedUser, permission: finalPermission };

    setUsers(users.map((u) => (u.id === editUserId ? updatedUser : u)));
    setEditUserId(null);
    setEditedUser({});
    setSelectedPermissions([]);
    setShowPermissionPopup(false); 
    toast.success("User updated successfully!");
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditedUser({});
    setSelectedPermissions([]);
    setShowPermissionPopup(false);
  };

  const currentRole = showInputs ? newUser.role : editedUser.role;

  const showDeleteConfirmation = (user) => {
    toast.info(
      ({ closeToast }) => (
        <div className="custom-toast">
          <p>Are youe sure you want to delete <strong>{user.name}</strong>?</p>
          <div className="toast-buttons">
            <button onClick={() => { handleDeleteUser(user); closeToast(); }}>Yes</button>
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
  
  const handleDeleteUser = (user) => {
    setUsers(users.filter((u) => u.id !== user.id));
    toast.success("User deleted successfully!");
  };

  const [isAssigningPermissions, setIsAssigningPermissions] = useState(false);
  const [userToAssign, setUserToAssign] = useState(null);

  const handleSaveAssign = () => {
    if (!userToAssign) return;
  
    const updatedUsers = users.map((u) => {
      if (u.id === userToAssign.id) {
        let finalPermission = "Default";
        if (u.role === "Employee") {
          finalPermission = selectedPermissions.length === 0 ? "Default" : selectedPermissions;
        } else if (u.role === "Supplier") {
          finalPermission = selectedPermissions.includes("Inventory & Supply") ? "Inventory & Supply" : "Default";

        }
        return { ...u, permission: finalPermission };
      }
      return u;
    });
  
    setUsers(updatedUsers);
    setShowPermissionPopup(false);
    setSelectedPermissions([]);
    setUserToAssign(null);
    setIsAssigningPermissions(false);
    toast.success("Permissions updated successfully!");
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      {!showInputs && (
        <button className={styles.createButton} onClick={() => setShowInputs(true)}>
          <FontAwesomeIcon icon={faPlus} className={styles.icon} />
          Create New User
        </button>
      )}

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
                <input type="text" name="name" value={newUser.name} onChange={handleInputChange} className={styles.input} />
              </td>
              <td>
                <input type="email" name="email" value={newUser.email} onChange={handleInputChange} className={styles.input} />
              </td>
              <td>
                <input type="text" name="username" value={newUser.username} onChange={handleInputChange} className={styles.input} />
              </td>
              <td>
                <input type="password" name="password" value={newUser.password} onChange={handleInputChange} className={styles.input} />
              </td>
              <td className={styles.selectCell}>
                <select name="role" value={newUser.role} onChange={handleInputChange} className={styles.selectBox}>
                  <option value="">Select Role</option>
                  <option value="Customer">Customer</option>
                  <option value="Employee">Employee</option>
                  <option value="Supplier">Supplier</option>
                </select>
              </td>
              <td className={styles.dash}>—</td>
              <td className={styles.actions}>
                <div className={styles.actionWrapper}>
                  <FontAwesomeIcon icon={faCheck} className={styles.actionIcon} onClick={handleAddUser} data-action="Add" title="Add" />
                  <FontAwesomeIcon icon={faTimes} className={styles.actionIcon} onClick={() => { setShowInputs(false); setShowPermissionPopup(false); }} data-action="Cancel" title="Cancel" />
                </div>
              </td>
            </tr>
          )}

          {users.map((user) =>
            editUserId === user.id ? (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><input name="name" value={editedUser.name} onChange={handleInputEditChange} className={styles.input} /></td>
                <td><input name="email" value={editedUser.email} onChange={handleInputEditChange} className={styles.input} /></td>
                <td><input name="username" value={editedUser.username} onChange={handleInputEditChange} className={styles.input} /></td>
                <td><input name="password" value={editedUser.password} onChange={handleInputEditChange} className={styles.input} /></td>
                <td>
                  <select name="role" value={editedUser.role} onChange={handleInputEditChange} className={styles.selectBox}>
                    <option value="Customer">Customer</option>
                    <option value="Employee">Employee</option>
                    <option value="Supplier">Supplier</option>
                  </select>
                </td>
                <td>{Array.isArray(editedUser.permission) ? editedUser.permission.join(", ") : editedUser.permission}</td>
                <td className={styles.actions}>
                <div className={styles.actionWrapper}>
                  <FontAwesomeIcon icon={faCheck} className={styles.actionIcon} onClick={handleSaveEdit} data-action="Save" title="Save" />
                  <FontAwesomeIcon icon={faTimes} className={styles.actionIcon} onClick={handleCancelEdit} data-action="Cancel" title="Cancel" />
                </div>
                </td>
              </tr>
            ) : (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.password.replace(/./g, "•")}</td>
                <td>{user.role}</td>
                <td>{Array.isArray(user.permission) ? user.permission.join(", ") : user.permission}</td>
                <td className={styles.actions}>
                  <FontAwesomeIcon icon={faEdit} className={styles.actionIcon} onClick={() => handleEditClick(user)} data-action="Edit" title="Edit" />
                  <FontAwesomeIcon icon={faTrash} className={styles.actionIcon} onClick={() => showDeleteConfirmation(user)} data-action="Delete" title="Delete" />
                  <FontAwesomeIcon icon={faShieldAlt} className={styles.actionIcon} data-action="Assign Roles" title="Assign Roles" 
                    onClick={() => {
                      setUserToAssign(user);
                      const initialPermissions = Array.isArray(user.permission) ? user.permission : (user.permission === "Default") ? [] : [user.permission];
                      setSelectedPermissions(initialPermissions);
                      setShowPermissionPopup(true);
                      setIsAssigningPermissions(true); 
                    }}
                  />
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {showPermissionPopup && <div className={styles.overlay}></div>}
      {showPermissionPopup && (
        <div className={styles.permissionPopup}>
          <h4>Assign Permissions</h4>
          <div className={styles.checkboxList}>
            {currentRole === "Employee" &&
              allPermissions.map((perm) => (
                <label key={perm}>
                  <input type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => handleCheckboxChange(perm)}
                    disabled={selectedPermissions.length >= 3 && !selectedPermissions.includes(perm)}
                  />
                  {perm}
                </label>
            ))}

            {currentRole === "Supplier" && (
              <>
                <label>
                  <input type="radio" name="supplierPerm"
                    checked={selectedPermissions.includes("Default")}
                    onChange={() => setSelectedPermissions(["Default"])}
                  />
                  Default
                </label>
                <label>
                  <input type="radio" name="supplierPerm"
                    checked={selectedPermissions.includes("Inventory & Supply")}
                    onChange={() => setSelectedPermissions(["Inventory & Supply"])}
                  />
                  Inventory & Supply
                </label>
              </>
            )}
          </div>

          <div className={styles.checkboxList}>
            {userToAssign?.role === "Employee" &&
              allPermissions.map((perm) => (
                <label key={perm}>
                  <input type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => handleCheckboxChange(perm)}
                    disabled={selectedPermissions.length >= 3 && !selectedPermissions.includes(perm)}
                  />
                  {perm}
                </label>
            ))}

            {userToAssign?.role === "Supplier" && (
              <>
                <label>
                  <input type="radio" name="supplierPerm"
                    checked={selectedPermissions.includes("Default")}
                    onChange={() => setSelectedPermissions(["Default"])}
                  />
                  Default
                </label>
                <label>
                  <input type="radio" name="supplierPerm"
                    checked={selectedPermissions.includes("Inventory & Supply")}
                    onChange={() => setSelectedPermissions(["Inventory & Supply"])}
                  />
                  Inventory & Supply
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
                onClick={() => {
                  setShowPermissionPopup(false);
                  setUserToAssign(null);
                  setSelectedPermissions([]);
                  setIsAssigningPermissions(false); 
                }}
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



