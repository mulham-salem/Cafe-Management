import React, { useMemo, useState } from "react";
import styles from "../styles/InvoiceOverlay.module.css"; // نفس ملف الستايل تبعك أو انسخه جديد
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faMoneyBillWave,
  faCreditCard,
  faPiggyBank,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Props:
 * - invoice: {
 *     id, customerName, items:[{name, quantity, price}],
 *     receiptMethod, deliveryDetails?:{deliveryFee},
 *     totalPrice (number), loyalty?:{balance:number, pointValue:number}
 *   }
 * - onClose: () => void
 * - onOpenPayment: (payload:{ orderId:number|string, amount:number, discount:number }) => void
 * - onCashChosen?: (orderId) => void  (optional callback to update UI or refetch)
 */
export default function InvoiceOverlay({
  invoice,
  onClose,
  onOpenPayment,
  onCashChosen,
}) {
  const [usingPoints, setUsingPoints] = useState(0);
  const [applying, setApplying] = useState(false);
  const loyaltyBalance = invoice?.loyalty?.balance ?? 0; // points count
  const pointValue = invoice?.loyalty?.pointValue ?? 0.01; // 1 pt = $0.01 by default

  const subtotal = useMemo(() => {
    try {
      return Number(
        invoice.items
          .reduce((acc, it) => acc + it.price * it.quantity, 0)
          .toFixed(2)
      );
    } catch {
      return Number(invoice.totalPrice || 0);
    }
  }, [invoice]);

  const deliveryFee = Number(invoice?.deliveryDetails?.deliveryFee || 0);
  const grossTotal = useMemo(() =>{
    const fee = invoice.receiptMethod === "delivery" ? deliveryFee : 0;
    return Number((subtotal + fee).toFixed(2));
  },[subtotal, deliveryFee, invoice.receiptMethod]);  

  const maxPointsByAmount = Math.floor(grossTotal / pointValue); // max points that could be used by amount
  const maxUsablePoints = Math.max(
    0,
    Math.min(loyaltyBalance, maxPointsByAmount)
  );

  const discount = Number((usingPoints * pointValue).toFixed(2));
  const netTotal = Number(Math.max(0, grossTotal - discount).toFixed(2));

  const handleUseMax = () => setUsingPoints(maxUsablePoints);

  const handleApplyPoints = async () => {
    if (!usingPoints || usingPoints < 0) {
      toast.info("No points selected.");
      return;
    }
    if (usingPoints > loyaltyBalance) {
      toast.warning("You don't have enough points.");
      return;
    }
    if (usingPoints > maxUsablePoints) {
      toast.warning("Selected points exceed the invoice amount.");
      return;
    }

    try {
      setApplying(true);
      // Example API: lock/apply points to this order before payment
      await axios.post(`/api/loyalty/apply`, {
        orderId: invoice.id,
        points: usingPoints,
      });
      toast.success("Loyalty points applied.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to apply loyalty points. Please try again.";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleCash = async () => {
    try {
      // Optional: tell backend user chose Cash
     // await axios.post(`/api/orders/${invoice.id}/choose-cash`);
      toast.success("Cash selected. Please prepare the exact amount.");
      onClose();
      onCashChosen?.(invoice.id);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to set cash payment. Please try again.";
      toast.error(msg);
    }
  };

  const handleElectronic = () => {
    // Close this overlay, open Payment modal with netTotal
    onClose();
    onOpenPayment({
      orderId: invoice.id,
      amount: netTotal,
      discount, // for backend record
    });
  };

  return (
    <div className={styles.invoiceOverlay} aria-modal="true" role="dialog">
      <div className={styles.invoiceContent}>
        <button
          className={styles.closeOverlay}
          onClick={onClose}
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2>Invoice for Order #{invoice.id}</h2>

        <p>
          <strong>Customer:</strong> {invoice.customerName || "N/A"}
        </p>

        <ul className={styles.invoiceItems}>
          {invoice.items.map((item, idx) => (
            <li key={idx}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        {invoice.receiptMethod === "Delivery" && (
          <p className={styles.deliveryFee}>
            <span>Delivery Fee:</span> ${deliveryFee.toFixed(2)}
          </p>
        )}

        {/* Loyalty section */}
        <div className={styles.loyaltyBox}>
          <div className={styles.loyaltyHeader}>
            <FontAwesomeIcon icon={faPiggyBank} />
            <span>Loyalty</span>
          </div>
          <div className={styles.loyaltyRow}>
            <span>Balance:</span>
            <strong>{loyaltyBalance.toLocaleString()} pts</strong>
          </div>
          <div className={styles.loyaltyRow}>
            <span>Point value:</span>
            <strong>${pointValue.toFixed(2)} / pt</strong>
          </div>

          <div className={styles.loyaltyInputRow}>
            <label htmlFor="pointsInput">Use points</label>
            <input
              id="pointsInput"
              type="number"
              min={0}
              max={maxUsablePoints}
              value={usingPoints}
              onChange={(e) =>
                setUsingPoints(
                  Math.max(
                    0,
                    Math.min(maxUsablePoints, Number(e.target.value || 0))
                  )
                )
              }
              className={styles.pointsInput}
            />
            <button
              type="button"
              className={styles.useMaxBtn}
              onClick={handleUseMax}
            >
              Use Max
            </button>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handleApplyPoints}
              disabled={applying || !usingPoints}
            >
              {applying ? "Applying..." : "Apply"}
            </button>
          </div>

          <div className={styles.loyaltyNote}>
            <FontAwesomeIcon icon={faCircleInfo} />
            <span>
              Max usable for this invoice: {maxUsablePoints.toLocaleString()}{" "}
              pts
            </span>
          </div>
        </div>

        <div className={styles.totalsBox}>
          <div>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {invoice.receiptMethod === "Delivery" && (
            <div>
              <span>Delivery:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.discountRow}>
            <span>Discount:</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
          <div className={styles.totalAmount}>
            <span>Total:</span>
            <strong>${netTotal.toFixed(2)}</strong>
          </div>
        </div>

        <div className={styles.payActions}>
          <button className={styles.cashBtn} onClick={handleCash}>
            <FontAwesomeIcon icon={faMoneyBillWave} /> Cash
          </button>

          <button className={styles.electronicBtn} onClick={handleElectronic}>
            <FontAwesomeIcon icon={faCreditCard} /> Electronic
          </button>
        </div>
      </div>
    </div>
  );
}
