import React, { useState, useEffect } from 'react';
import styles from '../styles/TableReservation.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChair, faCheckCircle, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";


const TableReservation = () => {
  
  useEffect(() => {
    document.title = "Cafe Delights - Table Reservations";
  }, []);  

  const [activeTab, setActiveTab] = useState('new');
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [selectedTableId, setSelectedTableId] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState(null);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleDateChange = (e) => {
    setReservationDate(e.target.value);
  };
  
  const handleTimeChange = (e) => {
    setReservationTime(e.target.value);
  };
  
  const handleGuestsChange = (e) => {
    const guests = parseInt(e.target.value);
    setGuestCount(guests);

    const allTables = JSON.parse(localStorage.getItem('tables') || '[]');
    setTables(allTables); 
  };
  
  const handleTableSelect = (tableId) => {
    setSelectedTableId(tableId);
  };
  
  const handleConfirmReservation = () => {
    if (!reservationDate || !reservationTime || !guestCount || !selectedTableId) {
      toast.error('Please complete all fields before confirming.');
      return;
    }
  
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
    const conflict = reservations.find(
      (r) =>
        r.table_ID === selectedTableId &&
        new Date(r.reservationTime).getTime() === reservationDateTime.getTime()
    );
  
    if (conflict) {
      toast.error('Selected table is not available at this time. Please choose another.');
      return;
    }
  
    // let lastReserId = parseInt(localStorage.getItem('lastReserId')) || 0;
    // const newId = lastReserId + 1;
    // localStorage.setItem('lastReserId', newId);
    // loadReservationsFromLocalStorage();

    const newReservation = {
      id: uuidv4(),
      customer_ID: 1, 
      table_ID: selectedTableId,
      reservationTime: reservationDateTime.toISOString(),
      numberOfGuests: guestCount,
      status: 'Confirmed',
    };

    const updatedReservations = [...reservations, newReservation];
    setReservations(updatedReservations);
    saveReservationsToLocalStorage(updatedReservations);
  
    const updatedTables = tables.map((t) =>
      t.id === selectedTableId ? { ...t, status: 'Reserved' } : t
    );
    setTables(updatedTables);
    localStorage.setItem('tables', JSON.stringify(updatedTables));
  
    toast.success(
        <span style={{ display:'block', textAlign:'center' }}>
            🎉<strong style={{ color:'#110e0c', borderBottom: '2px solid #110e0c'}}>Reservation Confirmed!</strong><br/><br/>  
            <small>        
                📅 Date: {reservationDate} <br/>
                🕒 Time: {reservationTime} <br/> 
                👥 Guests: {guestCount} <br/>
                🍽️ Table ID: {selectedTableId}
            </small> 
        </span>
    );
      
    setReservationDate('');
    setReservationTime('');
    setGuestCount('');
    setSelectedTableId(null);
  };

  const loadTablesFromLocalStorage = () => {
    const saved = JSON.parse(localStorage.getItem('tables')) || [];
    setTables(saved);
  };
  
  const loadReservationsFromLocalStorage = () => {
    const saved = JSON.parse(localStorage.getItem('reservations')) || [];
    setReservations(saved);
    // if (saved.length === 0) {
    //     localStorage.setItem('lastReserId', '0'); 
    // } 
  };
  
  const saveReservationsToLocalStorage = (newReservations) => {
    localStorage.setItem('reservations', JSON.stringify(newReservations));
  };


  const handleEditReservation = (reservationId) => {
    const reservation = reservations.find((r) => r.id === reservationId);
    if (!reservation) return;
  
    const dateTime = new Date(reservation.reservationTime);
    const date = dateTime.toISOString().split('T')[0];
    const time = dateTime.toTimeString().split(':').slice(0, 2).join(':'); 
  
    setReservationDate(date);
    setReservationTime(time);
    setGuestCount(reservation.numberOfGuests);
    setSelectedTableId(reservation.table_ID);
  
    setIsEditing(true);
    setEditingReservationId(reservationId);
    setActiveTab('new'); 
  };
  
  
  
  const handleSaveChanges = () => {
    if (!reservationDate || !reservationTime || !guestCount || !selectedTableId) {
      toast.error('Please fill in all fields');
      return;
    }
  
    const updatedReservations = reservations.map((r) =>
      r.id === editingReservationId
        ? {
            ...r,
            reservationTime: `${reservationDate}T${reservationTime}`,
            numberOfGuests: guestCount,
            table_ID: selectedTableId,
          }
        : r
    );
  
    setReservations(updatedReservations);
    saveReservationsToLocalStorage(updatedReservations);
  
    const previousReservation = reservations.find((r) => r.id === editingReservationId);
    let updatedTables = [...tables];
  
    if (previousReservation.table_ID !== selectedTableId) {
      updatedTables = updatedTables.map((t) => {
        if (t.id === previousReservation.table_ID) return { ...t, status: 'Available' };
        if (t.id === selectedTableId) return { ...t, status: 'Reserved' };
        return t;
      });
  
      setTables(updatedTables);
      localStorage.setItem('tables', JSON.stringify(updatedTables));
    }
  
    toast.success(<span style={{ display:'block', textAlign:'center'}}><b> Reservation updated: </b> <br/>{guestCount} guests at table {selectedTableId}</span>);
    resetFormFields();
    setIsEditing(false);
    setEditingReservationId(null);
  };
  
  
  const resetFormFields = () => {
    setReservationDate('');
    setReservationTime('');
    setGuestCount('');
    setSelectedTableId(null);
  };
  
  
  const handleCancelReservation = (reservationId) => {
    const reservationToCancel = reservations.find((r) => r.id === reservationId);
    if (!reservationToCancel) return;
  
    const toastId = toast.info(
      <div className="confirm-table-toast">
        <p>
          <strong>Are you sure you want to cancel this reservation?</strong><br/><span>table #{reservationToCancel.table_ID}<br/>
          {new Date(reservationToCancel.reservationTime).toLocaleString()}</span>
        </p>
        <div className="toast-buttons-order">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              performCancellation(reservationToCancel);
            }}
            className= "toastTableConfirmBtn"
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className= "toastTableCancelBtn"
          >
            Dismiss
          </button>
        </div>
      </div>,
      {
        toastId: reservationId, 
        closeButton: false,
        position: 'top-right',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        icon: false,
        className: "custom-table-toast",
      }
    );
  };
  
  const performCancellation = (reservation) => {
    const updatedReservations = reservations.filter((r) => r.id !== reservation.id);
    setReservations(updatedReservations);
    saveReservationsToLocalStorage(updatedReservations);
  
    const updatedTables = tables.map((table) =>
      table.id === reservation.table_ID ? { ...table, status: 'Available' } : table
    );
    setTables(updatedTables);
    localStorage.setItem("tables", JSON.stringify(updatedTables));
    loadTablesFromLocalStorage();
  
    toast.success(
      `Reservation for table #${reservation.table_ID} has been canceled.`,
      { icon: "🗑️" }
    );
  };

  useEffect(() => {
    loadTablesFromLocalStorage();
    loadReservationsFromLocalStorage();
  }, []);

  return (
    <div className={styles.container}>
      <ToastContainer/>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'new' ? styles.active : ''}`}
          onClick={() => handleTabChange('new')}
        >
          🪑 New Reservation
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'my' ? styles.active : ''}`}
          onClick={() => handleTabChange('my')}
        >
          📋 My Reservations
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'new' && (
          <div className={ `${styles.newReservation} ${styles.fadeInTab}` }>
            <div className={styles.formColumn}>
              <h2>Reserve a Table</h2>
              <div className={styles.formGroup}>
                <label>Date:</label>
                <input type="date" value={reservationDate} onChange={handleDateChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Time:</label>
                <input type="time" value={reservationTime} onChange={handleTimeChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Guests:</label>
                <select value={guestCount} onChange={handleGuestsChange}>
                  <option value="">select guests</option>
                  {[...Array(10).keys()].map(n => (
                    <option key={n + 1} value={n + 1}>{n + 1}</option>
                  ))}
                </select>
              </div>
              {!isEditing && (
                <button className={styles.confirmBtn} onClick={handleConfirmReservation}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Confirm Reservation
                </button>
              )}
              {isEditing && (
                <button className={styles.confirmBtn} onClick={handleSaveChanges}>
                    Save Changes
                </button>
              )}
            </div>

            <div className={styles.tableColumn}>
              <h3>Available Tables</h3>
              <div className={styles.tableGrid}>
                {tables.filter((table) => table.capacity >= Number(guestCount) && table.status !== 'Reserved' && table.status !== 'Cleaning')
                    .map((table) => (
                    <div key={table.id} className={styles.tableCard}>
                      <FontAwesomeIcon icon={faChair} className={styles.icon} />
                      <p>Table #{table.number}</p>
                      <p>Capacity: {table.capacity}</p>
                      <p>Status: {table.status}</p>
                      <button onClick={() => handleTableSelect(table.id)}>Select</button>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}  

        {activeTab === 'my' && (
          <div className={ `${styles.myReservations} ${styles.fadeInTab}` }>
            <h2>My Reservations</h2>
            <div className={styles.reservationList}>
              {reservations.map(res => (
                <div key={res.id} className={styles.reservationCard}>
                  <p><strong>Date:</strong> {new Date(res.reservationTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Guests:</strong> {res.numberOfGuests}</p>
                  <p><strong>Table:</strong> #{res.table_ID}</p>
                  <p><strong>Status:</strong> {res.status}</p>
                  <div className={styles.actionButtons}>
                    <button onClick={() => handleEditReservation(res.id)} title='edit'>
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button onClick={() => handleCancelReservation(res.id)} title='Delete'>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableReservation;