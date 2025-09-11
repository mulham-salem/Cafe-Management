import { useEffect, useState } from "react";
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
 *     pickupMethod, deliveryDetails?:{deliveryFee},
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
  const [netTotal, setNetTotal] = useState(Number(invoice?.totalPrice ?? 0));
  const [loyaltyBalance, setLoyaltyBalance] = useState(
    invoice?.loyaltyBalance ?? 0
  );
  const [loyaltyTier, setLoyaltyTier] = useState(
    invoice?.loyaltyTier ?? "Bronze"
  );
  const [pointValue, setPointValue] = useState(
    invoice?.loyaltyPointValue ?? 0.01
  );
  const [discount, setDiscount] = useState(0);

  const subtotal = Number(invoice?.subtotal ?? 0);
  const deliveryFee = Number(invoice?.deliveryDetails ?? 0);
  const grossTotal = Number(invoice?.grossTotal ?? 0);

  const fakeBalance = Math.max(0, loyaltyBalance - usingPoints);

  const token =
    sessionStorage.getItem("customerToken") ||
    localStorage.getItem("customerToken");

  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:8000/api";
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.defaults.headers.put["Content-Type"] = "application/json";

  const fetchPreview = async () => {
    try {
      const res = await axios.post("/user/customer/loyalty/preview-points", {
        orderId: invoice.id,
        points: usingPoints,
      });
      setDiscount(Number(res.data.bill.discount));
      setNetTotal(Number(res.data.bill.total_amount));
    } catch (err) {
      console.error("Preview error", err);
    }
  };

  // 🔥 مراقبة التغيير
  useEffect(() => {
    if (usingPoints > 0) {
      fetchPreview(usingPoints);
    }
  }, [usingPoints]);

  const handleApplyPoints = async () => {
    if (!usingPoints || usingPoints < 0) {
      toast.info("No points selected.");
      return;
    }
    if (usingPoints > loyaltyBalance) {
      toast.warning("You don't have enough points.");
      return;
    }

    try {
      setApplying(true);
      // Example API: lock/apply points to this order before payment
      const res = await axios.post(`/user/customer/loyalty/apply`, {
        orderId: invoice.id,
        points: usingPoints,
      });
      toast.success(res.data.message || "Loyalty points applied.");
      const { bill, loyalty } = res.data;

      setDiscount(Number(bill?.discount ?? discount));
      setNetTotal(Number(bill?.total_price ?? netTotal));

      setLoyaltyBalance(loyalty?.balance ?? loyaltyBalance);
      setLoyaltyTier(loyalty?.tier ?? loyaltyTier);
      setPointValue(loyalty?.point_value ?? pointValue);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to apply loyalty points. Please try again.";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  };

  const maxPointsByAmount = Math.floor(grossTotal / pointValue);

  const maxUsablePoints = Math.min(loyaltyBalance, maxPointsByAmount);

  const handleUseMax = () => setUsingPoints(loyaltyBalance);

  const handleCash = () => {
    onClose();
    onCashChosen?.(invoice.id);
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
          <strong>Customer:</strong> {invoice.username || "N/A"}
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

        {invoice.pickupMethod === "delivery" && (
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
            <strong>
              {applying
                ? loyaltyBalance.toLocaleString()
                : fakeBalance.toLocaleString()}{" "}
              pts
            </strong>
          </div>
          <div className={styles.loyaltyRow}>
            <span>Point value:</span>
            <strong>${pointValue.toFixed(2)} / pt</strong>
          </div>
          <div className={styles.loyaltyRow}>
            <span>Tier:</span>
            <strong>{loyaltyTier.toUpperCase()}</strong>
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
          {invoice.pickupMethod === "delivery" && (
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
