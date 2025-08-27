import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTimes, FaStar } from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/RatingModal.module.css"; // <-- CSS Module
import Rating from "react-rating";

const RatingModal = ({ open, onClose, order }) => {
  const [orderRating, setOrderRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const isDelivery = order?.receiptMethod === "Delivery";

  const handleSubmit = async () => {
    if (orderRating === 0) {
      toast.error("Please rate the order first!");
      return;
    }
    if (isDelivery && deliveryRating === 0) {
      toast.error("Please rate the delivery service!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId: order.id,
        orderRating,
        deliveryRating: isDelivery ? deliveryRating : null,
        notes,
      };

      // API call
      //await axios.post("/api/orders/rate", payload);

      toast.success("Your rating has been submitted!");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit rating. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, setRating) => (
    <motion.div
      className={styles.stars}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Rating
        fractions={2} // 🔥 يسمح بنص نجمة
        initialRating={rating}
        onChange={(value) => setRating(value)}
        emptySymbol={<FaStar size={28} className={styles.star} />}
        fullSymbol={
          <FaStar size={28} className={`${styles.star} ${styles.filled}`} />
        }
      />
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "ease" }}
          >
            <motion.div
              className={styles.ratingModal}
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.6, ease: "ease" }}
            >
              <button className={styles.closeBtn} onClick={onClose}>
                <FaTimes size={22} />
              </button>

              <h2 className={styles.modalTitle}>Rate Your Order</h2>

              <label className={styles.label}>Order Rating:</label>
              {renderStars(orderRating, setOrderRating)}

              {isDelivery && (
                <>
                  <label className={styles.label}>Delivery Rating:</label>
                  {renderStars(deliveryRating, setDeliveryRating)}
                </>
              )}

              <label className={styles.label}>Notes (optional):</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className={styles.notes}
              />

              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Rating"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RatingModal;
