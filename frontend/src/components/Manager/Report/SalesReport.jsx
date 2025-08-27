import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "../../styles/SalesReport.module.css";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiCalendar, FiClock, FiTrendingUp } from "react-icons/fi";
import { HiOutlineArrowSmDown } from "react-icons/hi";

/**
 * SalesReport component
 *
 * - Fetches report from GET /api/reports/sales?type=...&start_date=...&end_date=...
 * - Expects JSON shape (example in comment below)
 *
 * {
 *  "summary": {
 *    "total_orders": 250,
 *    "top_items": [{ "name": "Latte", "sales": 50 }, ...],
 *    "top_sales": [{ "date":"2025-08-01","sales":320 }, ...]
 *  },
 *  "report_info": {
 *    "start_date": "2025-08-01",
 *    "end_date": "2025-08-07",
 *    "generated_at": "2025-08-11 14:00"
 *  }
 * }
 */

const mockResponse = {
  summary: {
    total_orders: 47,
    top_items: [
      { name: "Latte", sales: 50 },
      { name: "Espresso", sales: 40 },
      { name: "Cappuccino", sales: 30 },
    ],
    top_sales: [
      { date: "2025-08-01", sales: 220.5 },
      { date: "2025-08-02", sales: 180.0 },
      { date: "2025-08-03", sales: 300.25 },
      { date: "2025-08-04", sales: 150.0 },
      { date: "2025-08-05", sales: 200.0 },
    ],
  },
  report_info: {
    start_date: "2025-08-01",
    end_date: "2025-08-05",
    generated_at: "2025-08-11 14:00",
  },
};

export default function SalesReport() {
  const [type, setType] = useState("daily"); // daily | weekly | monthly
  const [startDate, setStartDate] = useState(
    () => mockResponse.report_info.start_date
  );
  const [endDate, setEndDate] = useState(
    () => mockResponse.report_info.end_date
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // helper to format dates for display (YYYY-MM-DD -> readable)
  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  /**
   * fetchReport
   * accepts optional opts: { t, start, end }
   */
  const fetchReport = useCallback(
    async (opts = {}) => {
      const { t = type, start = startDate, end = endDate } = opts;
      setLoading(true);
      try {
        const res = await axios.get("/api/reports/sales", {
          params: {
            type: t,
            start_date: start,
            end_date: end,
          },
          // headers: { Authorization: `Bearer ${token}` } // add if needed
        });

        // expect res.data to be in the format we described
        setData(res.data);
      } catch (err) {
        // fallback to mock, and show toast (you can remove fallback in prod)
        console.error("Failed fetching sales report:", err);
        toast.error("Failed fetching sales report:", err);
        setData(mockResponse);
      } finally {
        setLoading(false);
      }
    },
    [type, startDate, endDate]
  );

  // initial fetch & whenever type / dates change
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // handlers for quick period buttons
  const applyPeriod = (period) => {
    const today = new Date();
    let s, e;
    e = today.toISOString().slice(0, 10); // YYYY-MM-DD
    if (period === "daily") {
      s = e;
    } else if (period === "weekly") {
      const past = new Date();
      past.setDate(today.getDate() - 6);
      s = past.toISOString().slice(0, 10);
    } else if (period === "monthly") {
      const past = new Date();
      past.setMonth(today.getMonth() - 1);
      s = past.toISOString().slice(0, 10);
    } else {
      s = startDate;
    }

    setType(period);
    setStartDate(s);
    setEndDate(e);

    // fire fetch quickly
    fetchReport({ t: period, start: s, end: e });
  };

  // transform chart data if present
  const chartData =
    data && data.summary && data.summary.top_sales
      ? data.summary.top_sales.map((item) => ({
          date: item.date,
          sales: item.sales,
        }))
      : [];

  return (
    <motion.section
      className={`${styles.container} ${styles.fullHeight}`} // added fullHeight to let the section fill parent's available space
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header + controls */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <FiTrendingUp className={styles.headerIcon} /> Sales Reports
          </h2>
          <p className={styles.subtitle}>
            View sales by period: daily, weekly, monthly.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.quickButtons}>
            <button
              className={`${styles.periodBtn} ${
                type === "daily" ? styles.active : ""
              }`}
              onClick={() => applyPeriod("daily")}
            >
              Daily
            </button>
            <button
              className={`${styles.periodBtn} ${
                type === "weekly" ? styles.active : ""
              }`}
              onClick={() => applyPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              className={`${styles.periodBtn} ${
                type === "monthly" ? styles.active : ""
              }`}
              onClick={() => applyPeriod("monthly")}
            >
              Monthly
            </button>
          </div>

          <div className={styles.dateInputs}>
            <label className={styles.dateLabel}>
              <FiCalendar />{" "}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className={styles.dateLabel}>
              <FiClock />{" "}
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button
              className={styles.fetchBtn}
              onClick={() =>
                fetchReport({ t: type, start: startDate, end: endDate })
              }
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Top area + bottom area inside scrollable wrapper */}
      <div className={styles.contentWrapper}>
        <motion.div
          className={styles.infoCard}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className={styles.infoRow}>
            <div>
              <div className={styles.infoLabel}>Start Date</div>
              <div className={styles.infoValue}>
                {data?.report_info?.start_date
                  ? fmtDate(data.report_info.start_date)
                  : "-"}
              </div>
            </div>

            <div>
              <div className={styles.infoLabel}>End Date</div>
              <div className={styles.infoValue}>
                {data?.report_info?.end_date
                  ? fmtDate(data.report_info.end_date)
                  : "-"}
              </div>
            </div>

            <div>
              <div className={styles.infoLabel}>Generated At</div>
              <div className={styles.infoValue}>
                {data?.report_info?.generated_at || "-"}
              </div>
            </div>

            <div>
              <div className={styles.infoLabel}>Total Orders</div>
              <div className={`${styles.infoValue} ${styles.big}`}>
                {data?.summary?.total_orders ?? 0}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          <div className={styles.chartHead}>
            <h3>Sales Trend</h3>
            <div className={styles.smallHint}>
              Sales trend within the period
            </div>
          </div>

          <div className={styles.chartWrap}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : chartData.length === 0 ? (
              <div className={styles.empty}>
                No data available for selected period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(dateStr) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString("default", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    textAnchor="end"
                    angle={-30}
                    height={35}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#a1580e"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    animationDuration={700}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.aside
          className={styles.topItemsCard}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
        >
          <h4>Top Items</h4>
          <ul className={styles.topItemsList}>
            {data?.summary?.top_items && data.summary.top_items.length > 0 ? (
              data.summary.top_items.map((it) => (
                <li key={it.name} className={styles.topItem}>
                  <div className={styles.rank}>
                    <HiOutlineArrowSmDown />
                  </div>
                  <div className={styles.itemName}>{it.name}</div>
                  <div className={styles.itemSales}>{it.sales}</div>
                </li>
              ))
            ) : (
              <li className={styles.emptyItem}>No items sold</li>
            )}
          </ul>
        </motion.aside>

        {/* Footer area: small table or list for top sales */}
        <motion.div
          className={styles.bottomArea}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3 className={styles.sectionTitle}>Top Sales By Date</h3>

          {data?.summary?.top_sales && data.summary.top_sales.length > 0 ? (
            <div className={styles.salesList}>
              {data.summary.top_sales.map((row) => (
                <motion.div
                  key={row.date}
                  className={styles.salesRow}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className={styles.rowDate}>{row.date}</div>
                  <div className={styles.rowValue}>{row.sales}</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No sales data available</div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
