import React, { useState, useEffect } from "react";
import styles from "../styles/TableReservation.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChair,
  faCheckCircle,
  faTrash,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/toastStyles.css";
import axios from "axios";
import { motion } from "framer-motion";
import VisualTableMap from "./../Employee/VisualTableMap";

const mockTables = [
  {
    id: 1,
    number: 1,
    capacity: 2,
    status: "available",
  },
  {
    id: 2,
    number: 2,
    capacity: 4,
    status: "available",
  },
  {
    id: 3,
    number: 3,
    capacity: 6,
    status: "available",
  },
  {
    id: 4,
    number: 4,
    capacity: 2,
    status: "available",
  },
  {
    id: 5,
    number: 5,
    capacity: 8,
    status: "available",
  },
  {
    id: 6,
    number: 6,
    capacity: 4,
    status: "available",
  },
  {
    id: 7,
    number: 7,
    capacity: 2,
    status: "available",
  },
  {
    id: 8,
    number: 8,
    capacity: 6,
    status: "available",
  },
  {
    id: 9,
    number: 9,
    capacity: 4,
    status: "available",
  },
  {
    id: 10,
    number: 10,
    capacity: 4,
    status: "available",
  },
  {
    id: 11,
    number: 9,
    capacity: 4,
    status: "available",
  },
  {
    id: 12,
    number: 10,
    capacity: 4,
    status: "available",
  },
];

const TableReservation = () => {
  useEffect(() => {
    document.title = "Cafe Delights - Table Reservations";
  }, []);

  const [activeTab, setActiveTab] = useState("new");
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingReser, setLoadingReser] = useState(true);

  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [selectedTableId, setSelectedTableId] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState(null);

  const token =
    sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:8000/api";
  axios.defaults.headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "my") {
      fetchReservations();
    }
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
    if (guests) {
      fetchAvailableTables(guests);
    } else {
      fetchAvailableTables(guestCount);
    }
  };

  const handleTableSelect = (tableId) => {
    setSelectedTableId(tableId);
  };

  const fetchAvailableTables = async (guests) => {
    try {
      // const response = await axios.get(`/user/customer/table-reservation/available`, {
      //   params: { guest_count: guests }
      // });
      // setTables(response.data);
      setTables(mockTables);
    } catch (error) {
      // toast.error('Failed to load available tables.');
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await axios.get("/user/customer/table-reservation");
      setReservations(response.data);
    } catch (error) {
      // toast.error('Failed to load your reservations.');
    } finally {
      setLoadingReser(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (
      !reservationDate ||
      !reservationTime ||
      !guestCount ||
      !selectedTableId
    ) {
      toast.error("Please complete all fields before confirming.");
      return;
    }

    try {
      const reservationDateTime = `${reservationDate}T${reservationTime}:00`;

      const newReservation = {
        table_id: selectedTableId,
        reservation_time: reservationDateTime,
        numberOfGuests: guestCount,
      };

      const response = await axios.post(
        "/user/customer/table-reservation",
        newReservation
      );

      toast.success(
        <div className="reservation-toast">
          <div className="reservation-toast-title">
            🎉 Reservation Confirmed!
          </div>
          <div className="reservation-toast-details">
            <div>
              📅<span>Date:</span> {reservationDate}{" "}
            </div>
            <div>
              🕒<span>Time:</span> {reservationTime}{" "}
            </div>
            <div>
              👥<span>Guests:</span> {guestCount}{" "}
            </div>
            <div>
              🍽️<span>Table:</span> {selectedTableId}{" "}
            </div>
          </div>
        </div>,
        {
          className: "reservation-toast-wrapper",
          icon: false,
          hideProgressBar: true,
        }
      );
      fetchReservations();
      fetchAvailableTables(guestCount);
      resetFormFields();
    } catch (error) {
      console.error("Error confirming reservation:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to confirm reservation. Please try again.");
      }
    }
  };

  const handleEditReservation = (reservationId) => {
    const reservation = reservations.find((r) => r.id === reservationId);
    if (!reservation) return;

    const dateTime = new Date(reservation.reservation_time);
    const date = dateTime.toISOString().split("T")[0];
    const time = dateTime.toTimeString().split(":").slice(0, 2).join(":");

    setReservationDate(date);
    setReservationTime(time);
    setGuestCount(reservation.numberOfGuests);
    setSelectedTableId(reservation.table_id);

    setIsEditing(true);
    setEditingReservationId(reservationId);
    setActiveTab("new");

    if (reservation.numberOfGuests) {
      fetchAvailableTables(reservation.numberOfGuests);
    }
  };

  const handleSaveChanges = async () => {
    if (
      !reservationDate ||
      !reservationTime ||
      !guestCount ||
      !selectedTableId
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const reservationDateTime = `${reservationDate}T${reservationTime}:00`;

      const updatedData = {
        table_id: selectedTableId,
        reservation_time: reservationDateTime,
        numberOfGuests: guestCount,
      };

      await axios.put(
        `/user/customer/table-reservation/${editingReservationId}`,
        updatedData
      );

      fetchReservations();
      fetchAvailableTables(guestCount);

      toast.success(
        <span style={{ display: "block", textAlign: "center" }}>
          <b> Reservation updated: </b> <br />
          {guestCount} guests at table {selectedTableId}
        </span>
      );

      resetFormFields();
      setIsEditing(false);
      setEditingReservationId(null);
    } catch (error) {
      console.error("Error saving changes:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save changes. Please try again.");
      }
    }
  };

  const resetFormFields = () => {
    setReservationDate("");
    setReservationTime("");
    setGuestCount("");
    setSelectedTableId(null);
  };

  const handleCancelReservation = (reservationId) => {
    const reservationToCancel = reservations.find(
      (r) => r.id === reservationId
    );
    if (!reservationToCancel) return;

    const toastId = toast.info(
      <div className="confirm-table-toast">
        <p>
          <strong>Are you sure you want to cancel this reservation?</strong>
          <br />
          <span>
            table #{reservationToCancel.table_id}
            <br />
            {new Date(reservationToCancel.reservation_time).toLocaleString()}
          </span>
        </p>
        <div className="toast-buttons-order">
          <button
            onClick={() => {
              toast.dismiss(toastId);
              performCancellation(reservationToCancel);
            }}
            className="toastTableConfirmBtn"
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="toastTableCancelBtn"
          >
            Dismiss
          </button>
        </div>
      </div>,
      {
        toastId: reservationId,
        closeButton: false,
        position: "top-right",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        icon: false,
        className: "custom-table-toast",
      }
    );
  };

  const performCancellation = async (reservation) => {
    try {
      await axios.delete(`/user/customer/table-reservation/${reservation.id}`);

      fetchReservations();
      fetchAvailableTables(guestCount || 1);

      toast.success(
        `Reservation for table #${reservation.table_id} has been canceled`,
        { icon: "🗑️" }
      );
    } catch (error) {
      console.error("Error canceling reservation:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to cancel reservation. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchAvailableTables(1);
    fetchReservations();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "new" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("new")}
        >
          🪑 New Reservation
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "map" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("map")}
        >
          🗺️ Visual Map
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "my" ? styles.active : ""
          }`}
          onClick={() => handleTabChange("my")}
        >
          📋 My Reservations
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "new" && (
          <div className={`${styles.newReservation} ${styles.fadeInTab}`}>
            <div className={`${styles.formColumn} ${styles.fadeInTab}`}>
              <h2>Reserve a Table</h2>
              <div className={styles.formGroup}>
                <label>Date:</label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Time:</label>
                <input
                  type="time"
                  value={reservationTime}
                  onChange={handleTimeChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Guests:</label>
                <select value={guestCount} onChange={handleGuestsChange}>
                  <option value="1">select guests</option>
                  {[...Array(10).keys()].map((n) => (
                    <option key={n + 1} value={n + 1}>
                      {n + 1}
                    </option>
                  ))}
                </select>
              </div>
              {!isEditing && (
                <button
                  className={styles.confirmBtn}
                  onClick={handleConfirmReservation}
                >
                  <FontAwesomeIcon icon={faCheckCircle} /> Confirm Reservation
                </button>
              )}
              {isEditing && (
                <button
                  className={styles.confirmBtn}
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              )}
            </div>

            <div className={styles.tableColumn}>
              <h3>Available Tables</h3>
              <div className={styles.tableGrid}>
                {loadingTables ? (
                  <div className={styles.loadingSpinner}></div>
                ) : (
                  tables
                    .filter(
                      (table) =>
                        table.status === "available" &&
                        table.capacity >= Number(guestCount)
                    )
                    .map((table) => (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{
                          opacity: 1,
                          scale:
                            selectedTableId === table.id ? [1, 1.08, 1] : 1,
                          boxShadow:
                            selectedTableId === table.id
                              ? "0 0 20px rgba(165, 140, 111, 0.6)"
                              : "0 2px 10px rgba(0, 0, 0, 0.2)",
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: selectedTableId === table.id ? Infinity : 0,
                          repeatType: "loop",
                          repeatDelay: 1,
                          ease: "easeInOut",
                        }}
                        className={`${styles.tableCard} ${
                          selectedTableId === table.id ? styles.selected : ""
                        } ${styles.fadeInTable}`}
                        onClick={() => handleTableSelect(table.id)}
                      >
                        <FontAwesomeIcon
                          icon={faChair}
                          className={styles.icon}
                        />
                        <p>Table #{table.id}</p>
                        <p>Capacity: {table.capacity}</p>
                        <p>Status: {table.status}</p>
                      </motion.div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "my" && (
          <div className={`${styles.myReservations} ${styles.fadeInTab}`}>
            <h2>My Reservations</h2>
            <div className={styles.reservationList}>
              {loadingReser ? (
                <div className={styles.loadingOverlay}>
                  <p className={styles.emptyText}>Loading...</p>
                </div>
              ) : !loadingReser && reservations.length === 0 ? (
                <div className={styles.loadingOverlay}>
                  <p className={styles.noReservationsMessage}>
                    {" "}
                    You have no active reservations at the moment.{" "}
                  </p>
                </div>
              ) : (
                reservations.map((res) => (
                  <div key={res.id} className={styles.reservationCard}>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(res.reservation_time).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(res.reservation_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>
                      <strong>Guests:</strong> {res.numberOfGuests}
                    </p>
                    <p>
                      <strong>Table:</strong> #{res.table_id}
                    </p>
                    <p>
                      <strong>Status:</strong> {res.status}
                    </p>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEditReservation(res.id)}
                        title="edit"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        title="Cancel"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className={styles.visualMap}>
            <VisualTableMap readonly={true}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableReservation;
