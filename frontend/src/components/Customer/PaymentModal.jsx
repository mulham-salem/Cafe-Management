import React, { useState } from "react";
import styles from "../styles/PaymentModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCircleCheck,
  faTriangleExclamation,
  faCreditCard,
  faAppleWhole,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - payload: { orderId, amount:number, discount:number }
 * - onPaid?: (orderId) => void
 */
export default function PaymentModal({ open, onClose, payload, onPaid }) {
  const [method, setMethod] = useState("card"); // 'card' | 'apple'
  const [processing, setProcessing] = useState(false);

  // Simple card form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  if (!open) return null;

  const handlePay = async () => {
    if (method === "card") {
      if (!cardName || !cardNumber || !expiry || !cvc) {
        toast.warning("Please fill all card fields.");
        return;
      }
    }

    try {
      setProcessing(true);
      // Example API: execute charge
      // const res = await axios.post(`/api/payments/charge`, {
      //   orderId: payload.orderId,
      //   amount: payload.amount,
      //   discount: payload.discount,
      //   method,
      //   card:
      //     method === "card"
      //       ? { name: cardName, number: cardNumber, expiry, cvc }
      //       : undefined,
      // });

      // if (res?.data?.status === "succeeded") {
        toast.success("Payment successful.");
        onClose();
        onPaid?.(payload.orderId);
      // } else {
      //   toast.error("Payment failed. You can retry or choose another method.");
      // }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Payment failed. You can retry or choose another method.";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.modalOverlay} aria-modal="true" role="dialog">
      <div className={styles.modalCard}>
        <button className={styles.closeOverlay} onClick={onClose} aria-label="Close">
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h3>Electronic Payment</h3>
        <div className={styles.amountRow}>
          <span>Amount Due</span>
          <strong>${Number(payload.amount || 0).toFixed(2)}</strong>
        </div>

        <div className={styles.methods}>
          <button
            type="button"
            className={`${styles.methodBtn} ${method === "card" ? styles.active : ""}`}
            onClick={() => setMethod("card")}
            aria-pressed={method === "card"}
          >
            <FontAwesomeIcon icon={faCreditCard} /> Visa / Mastercard
          </button>

          <button
            type="button"
            className={`${styles.methodBtn} ${method === "apple" ? styles.active : ""}`}
            onClick={() => setMethod("apple")}
            aria-pressed={method === "apple"}
          >
            <FontAwesomeIcon icon={faAppleWhole} /> Apple Pay
          </button>
        </div>

        {method === "card" ? (
          <div className={styles.cardForm}>
            <div className={styles.field}>
              <label>Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className={styles.field}>
              <label>Card Number</label>
              <input
                inputMode="numeric"
                pattern="[0-9 ]*"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
              />
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label>Expiry (MM/YY)</label>
                <input
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="08/27"
                  maxLength={5}
                />
              </div>
              <div className={styles.field}>
                <label>CVC</label>
                <input
                  inputMode="numeric"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            <div className={styles.notice}>
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <span>Do not share your card details with anyone.</span>
            </div>
          </div>
        ) : (
          <div className={styles.applePayMock}>
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>Apple Pay will use your saved wallet.</span>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.payBtn} disabled={processing} onClick={handlePay}>
            {processing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}