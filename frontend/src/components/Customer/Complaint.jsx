import { useState } from "react";
import { X, Send, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import styles from "../styles/Complaint.module.css";

export default function ComplaintModal({ open, onClose }) {
  const [type, setType] = useState("order");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  // API method
  async function submitComplaint() {
    if (!details.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/complaints", { type, details });
      toast.success("Complaint submitted successfully");
      setDetails("");
      setType("order");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className={styles.modalTitle}>
          <AlertCircle className={styles.inlineIcon} /> Submit Complaint
        </h2>

        <div className={styles.inputGroup}>
          <label className={styles.modalSelectLabel}>
            Complaint Type
            <select
              className={styles.modalSelect}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="order">Order</option>
              <option value="reservation">Reservation</option>
              <option value="service">Service</option>
            </select>
          </label>

          <label className={styles.modalTextareaLabel}>
            Desciption
            <textarea
              className={styles.modalTextarea}
              rows="4"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </label>

          <button
            className={styles.submitBtn}
            onClick={submitComplaint}
            disabled={loading}
          >
            <Send size={18} className={styles.inlineIcon} />
            {loading ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
