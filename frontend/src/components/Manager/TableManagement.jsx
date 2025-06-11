import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/TableManagement.module.css';
import "../styles/toastStyles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const TableManagement = () => {
   useEffect(() => {
    document.title = "Cafe Delights - Table Management";
   }, []);
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ number: '', capacity: '' });
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

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

  const handleAddClick = () => {
    setNewTable({ number: '', capacity: '' });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setNewTable({ ...newTable, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numberExists = tables.some((t) => t.number === parseInt(newTable.number));
    if (numberExists) {
      toast.error('Table number already exists');
      return;
    }

    const newEntry = {
      id: Date.now(),
      number: parseInt(newTable.number),
      capacity: parseInt(newTable.capacity),
      status: 'Available',
    };

    setTables([...tables, newEntry]);
    toast.success('Table added successfully');
    setShowForm(false);
  };

  const nextStatus = (status) => {
    switch (status) {
      case 'Available': return 'Reserved';
      case 'Reserved': return 'Cleaning';
      case 'Cleaning': return 'Available';
      default: return 'Available';
    }
  };

  const handleStatusUpdate = (id, currentStatus) => {
    if (currentStatus === 'Reserved') {
      toast.warn(
        <div className="custom-toast">
          This table is currently reserved. <br/><br/> <span>Are you sure you want to update status?</span>
          <button className= "toastConfirmBtn"
            onClick={() => {
              updateStatus(id);
              toast.dismiss();
            }}
          >
            Yes, update
          </button>
          <button className= "toastCancelBtn" onClick={() => toast.dismiss()} >
                  Cancel
          </button>

        </div>,
        { 
            toastId: `delete-table-${id}`, 
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
      updateStatus(id);
      toast.success('Table status updated');
    }
  };

  const updateStatus = (id) => {
    const updated = tables.map((table) =>
      table.id === id
        ? { ...table, status: nextStatus(table.status) }
        : table
    );
    setTables(updated);
  };

  const handleDelete = (id) => {
    toast.info(
        ({ closeToast }) => (
          <div className="custom-toast">
            <p>Are you sure you want to delete this table?</p>
            <div className="toast-buttons"> 
              <button 
                  onClick={() => {
                    setTables(tables.filter((table) => table.id !== id));
                    toast.success('Table deleted successfully');
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
              <td>{table.number}</td>
              <td>{table.capacity}</td>
              <td>{table.status}</td>
              <td className={styles.actions}>
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
    </div>
  );
};

export default TableManagement;