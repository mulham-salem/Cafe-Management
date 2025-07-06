import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/TableManagement.module.css';
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios'; 

const TableManagement = () => {

  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api", 
    withCredentials: true, 
    headers: {
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const [tables, setTables] = useState([]); 
  const [newTable, setNewTable] = useState({ number: '', capacity: '' });
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [loading, setLoading] = useState(true); 


  useEffect(() => {
    document.title = "Cafe Delights - Table Management";
    fetchTables();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setShowForm(false);
      }
    };
    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showForm]);

  const fetchTables = async () => {
    try {
      const response = await axiosInstance.get('/manager/table');
      setTables(response.data.tables); 
    } catch (error) {
      //toast.error('Failed to load tables.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setNewTable({ number: '', capacity: '' });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setNewTable({ ...newTable, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();

    if (!newTable.number || !newTable.capacity) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const response = await axiosInstance.post('/manager/table', {
        number: parseInt(newTable.number),
        capacity: parseInt(newTable.capacity),
        status: 'available', 
      });
      toast.success(response.data.message || 'Table added successfully');
      fetchTables(); 
      setShowForm(false);
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.status === 409 && error.response.data.message === 'Table already exists') {
          toast.error('Table number already exists. Please choose a different number.');
        } else if (error.response.status === 422 && error.response.data.errors) {
          Object.values(error.response.data.errors).forEach(([msg]) => toast.error(msg));
        } else {
          toast.error(error.response.data.message || 'Failed to add table.');
        }
      } else {
        toast.error('Failed to add table.');
      }
    }
  };

  const handleStatusUpdate = async (id, currentStatus) => { 
    const nextStatusValue = nextStatusLogic(currentStatus); 

    try {
      const response = await axiosInstance.put(`/manager/table/${id}`, {
        status: nextStatusValue,
      });
      toast.success(response.data.message || 'Table status updated successfully');
      fetchTables(); 
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response && error.response.status === 409 && error.response.data.message.includes('reserved')) {
        toast.warn(
          ({ closeToast }) => (
          <div className="custom-toast">
            {error.response.data.message} <br /> <span>Are you sure you want to update status?</span>
            <button className="toastConfirmBtn"
              onClick={async () => {
                try {
                  const confirmResponse = await axiosInstance.put(`/manager/table/${id}`, {
                    status: nextStatusValue,
                    confirm: true,
                  });
                  toast.success(confirmResponse.data.message || 'Table status updated successfully');
                  fetchTables();
                } catch (confirmError) {
                  console.error('Error confirming status update:', confirmError);
                  toast.error(confirmError.response?.data?.message || 'Failed to update status after confirmation.');
                }
                closeToast();
              }}
            >
              Yes, update
            </button>
            <button className="toastCancelBtn" onClick={() => closeToast()} >
              Cancel
            </button>
          </div>
          ),
          {
            toastId: `update-status-confirm-${id}`,
            position: "top-center",
            closeButton: false,
            autoClose: false,
            draggable: false,
            icon: false,
            className: "custom-toast-container",
            bodyClassName: "custom-toast-body",
          }
        );
      } else if (error.response && error.response.status === 422 && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status.');
      }
    }
  };

  const nextStatusLogic = (status) => {
    switch (status) {
      case 'available': return 'reserved';
      case 'reserved': return 'cleaning';
      case 'cleaning': return 'available';
      default: return 'available';
    }
  };

  const handleDelete = async (id) => { 
    const tableToDelete = tables.find(t => t.id === id); 

    toast.info(
      ({ closeToast }) => (
        <div className="custom-toast">
          <p>Are you sure you want to delete <br/> Table #{tableToDelete?.number}?</p> 
          <div className="toast-buttons">
            <button
              onClick={async () => {
                try {
                  const response = await axiosInstance.delete(`/manager/table/${id}`);
                  toast.success(response.data.message || 'Table deleted successfully');
                  fetchTables(); 
                } catch (error) {
                  console.error('Error deleting table:', error);
                  if (error.response && error.response.status === 409 && error.response.data.message.includes('reserved')) {
                    toast.warn(
                      ({ closeToast }) => (
                      <div className="custom-toast">
                        <p>{error.response.data.message} <br/> <span>Are you sure you want to proceed?</span></p>
                        <div className="toast-buttons">
                          <button
                            onClick={async () => {
                              try {
                                const confirmResponse = await axiosInstance.delete(`/manager/table/${id}`, {
                                  data: { confirm: true } 
                                });
                                toast.success(confirmResponse.data.message || 'Table deleted successfully');
                                fetchTables();
                              } catch (confirmError) {
                                console.error('Error confirming table delete:', confirmError);
                                toast.error(confirmError.response?.data?.message || 'Failed to delete table after confirmation.');
                              }
                              closeToast(); 
                            }}
                          >
                            Yes, delete
                          </button>
                          <button onClick={() => toast.dismiss()}>Cancel</button>
                        </div>
                      </div>
                      ),
                      {
                        toastId: `delete-table-confirm-${id}`,
                        position: "top-center",
                        closeButton: false,
                        autoClose: false,
                        draggable: false,
                        icon: false,
                        className: "custom-toast-container",
                        bodyClassName: "custom-toast-body",
                      }
                    );
                  } else {
                    toast.error(error.response?.data?.message || 'Failed to delete table.');
                  }
                }
                closeToast(); 
              }}
            >
              Yes
            </button>
            <button onClick={closeToast} >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        toastId: `delete-item-${id}`,
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


  return (
    <div className={styles.container}>
      <ToastContainer />
      {loading ? (
        <div className={styles.loadingOverlay}>
          <p className={styles.emptyText}>Loading...</p>
        </div>
      ) : (
      <>
      <div className={styles.headerRow}>
        <button className={styles.addButton} onClick={handleAddClick}>
         <FontAwesomeIcon icon={faPlus} /> Add Table
        </button>
      </div>

      {showForm && (
        <div className={`${styles.overlay} ${styles.modalOverlay}`}>
          <div className={`${styles.formContainer} ${styles.modal}`} ref={formRef}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <h3>Add New Table</h3>
              <input
                type="number"
                name="number"
                placeholder="Table Number"
                value={newTable.number}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={newTable.capacity}
                onChange={handleChange}
                required
              />
              <button type="submit" className={styles.saveButton}>Save</button>
            </form>
          </div>
        </div>
      )}
       <table className={styles.table}>
        <thead>
          <tr>
            <th>Table #</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Operations</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table.id}>
              <td data-label="Number">{table.number}</td>
              <td data-label="Capacity">{table.capacity}</td>
              <td data-label="Status">
                  { table.status.charAt(0).toUpperCase() + table.status.slice(1) }
              </td>
              <td data-label="Action" className={styles.actions}>
                <button onClick={() => handleStatusUpdate(table.id, table.status)} className={styles.statusBtn}>
                  <FontAwesomeIcon icon={faPen} data-action="Update Status" title="Update Status"/>
                </button>
                <button onClick={() => handleDelete(table.id)} className={styles.deleteBtn}>
                  <FontAwesomeIcon icon={faTrash} data-action="Delete" title="Delete"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </>
      )}
    </div>
  );
};

export default TableManagement;