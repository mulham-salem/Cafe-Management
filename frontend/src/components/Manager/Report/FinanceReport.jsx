import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "../../styles/FinanceReport.module.css";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiCalendar,
  FiDownload,
  FiPrinter,
  FiDollarSign,
} from "react-icons/fi";

/**
 * FinanceReport component
 *
 * - Fetches report from GET /api/reports/finance?type=...&start_date=...&end_date=...
 * - Expected JSON shape (example):
 * {
 *   "summary": {
 *     "net_profit": 1200.5,
 *     "total_expenses": 3000.0,
 *     "total_revenue": 4200.5,
 *     "breakdown": [
 *       { "period": "2025-01", "revenue": 1000, "expenses": 700 },
 *       { "period": "2025-02", "revenue": 1200, "expenses": 900 }
 *     ]
 *   },
 *   "report_info": {
 *     "start_date": "2025-01-01",
 *     "end_date": "2025-03-31",
 *     "generated_at": "2025-04-01 10:00:00"
 *   }
 * }
 *
 * Note: component expects the backend to aggregate data according to `type`
 * (monthly/quarterly/yearly) or accept custom start/end dates.
 */

const mockResponse = {
  summary: {
    net_profit: 12500.75,
    total_expenses: 48230.25,
    total_revenue: 60731.0,
    breakdown: [
      { period: "2025-Q1", revenue: 20000, expenses: 15000 },
      { period: "2025-Q2", revenue: 25000, expenses: 17000 },
      { period: "2025-Q3", revenue: 15731, expenses: 16230.25 },
    ],
  },
  report_info: {
    start_date: "2025-01-01",
    end_date: "2025-09-30",
    generated_at: "2025-10-01 09:12:00",
  },
};

export default function FinanceReport() {
  const [type, setType] = useState("monthly"); // monthly | quarterly | yearly
  const [startDate, setStartDate] = useState(
    () => mockResponse.report_info.start_date
  );
  const [endDate, setEndDate] = useState(
    () => mockResponse.report_info.end_date
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  const fetchReport = useCallback(
    async (opts = {}) => {
      const { t = type, start = startDate, end = endDate, signal } = opts;
      setLoading(true);
      try {
        const res = await axios.get("/api/reports/finance", {
          params: {
            type: t,
            start_date: start,
            end_date: end,
          },
        // headers: { Authorization: `Bearer ${token}` } // add if needed
        });

        setData(res.data);
      } catch (err) {
        console.error("Finance report fetch failed:", err);
        toast.error("Failed to fetch finance report — using sample data");
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

  const applyPeriod = (period) => {
    const today = new Date();
    let s, e;
    e = today.toISOString().slice(0, 10);
    if (period === "monthly") {
      // last 30 days as a proxy for "monthly"
      const past = new Date();
      past.setMonth(today.getMonth() - 1);
      s = past.toISOString().slice(0, 10);
    } else if (period === "quarterly") {
      const past = new Date();
      past.setMonth(today.getMonth() - 3);
      s = past.toISOString().slice(0, 10);
    } else if (period === "yearly") {
      const past = new Date();
      past.setFullYear(today.getFullYear() - 1);
      s = past.toISOString().slice(0, 10);
    } else {
      s = startDate;
    }

    setType(period);
    setStartDate(s);
    setEndDate(e);
    fetchReport({ t: period, start: s, end: e });
  };

  // CSV export helper (simple)
  const handleExportCSV = () => {
    const rows = [];
    const header = ["Period", "Revenue", "Expenses"];
    rows.push(header.join(","));
    const breakdown = data?.summary?.breakdown || [];
    breakdown.forEach((r) => {
      rows.push([r.period, r.revenue ?? 0, r.expenses ?? 0].join(","));
    });
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handlePrint = () => {
    window.print();
  };

  const breakdown = data?.summary?.breakdown || [];

  return (
    <motion.section
      className={`${styles.container} ${styles.fullHeight}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <ToastContainer position="top-right" autoClose={3500} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <FiDollarSign className={styles.headerIcon} /> Finance Reports
          </h2>
          <p className={styles.subtitle}>
            Generate financial reports: revenue, expenses, and net profit.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.quickButtons}>
            <button
              className={`${styles.periodBtn} ${
                type === "monthly" ? styles.active : ""
              }`}
              onClick={() => applyPeriod("monthly")}
            >
              Monthly
            </button>
            <button
              className={`${styles.periodBtn} ${
                type === "quarterly" ? styles.active : ""
              }`}
              onClick={() => applyPeriod("quarterly")}
            >
              Quarterly
            </button>
            <button
              className={`${styles.periodBtn} ${
                type === "yearly" ? styles.active : ""
              }`}
              onClick={() => applyPeriod("yearly")}
            >
              Yearly
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
              <FiCalendar />{" "}
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
            <button
              className={styles.iconBtn}
              onClick={handleExportCSV}
              title="Export CSV"
            >
              <FiDownload />
            </button>
            <button
              className={styles.iconBtn}
              onClick={handlePrint}
              title="Print"
            >
              <FiPrinter />
            </button>
          </div>
        </div>
      </div>

      {/* Content wrapper (scrollable) */}
      <div className={styles.contentWrapper}>
        {/* KPI summary */}
        <motion.div
          className={styles.infoCard}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
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
                {data?.report_info?.generated_at ?? "-"}
              </div>
            </div>

            <div>
              <div className={styles.infoLabel}>Net Profit</div>
              <div className={`${styles.infoValue} ${styles.big}`}>
                $
                {(
                  data?.summary?.net_profit ?? mockResponse.summary.net_profit
                ).toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart area */}
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className={styles.chartHead}>
            <h3>Revenue vs Expenses</h3>
            <div className={styles.smallHint}>
              Aggregated by selected period
            </div>
          </div>

          <div className={styles.chartWrap}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : breakdown.length === 0 ? (
              <div className={styles.empty}>
                No financial data for the selected period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={breakdown}
                  margin={{ top: 10, right: 24, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#2f8f4a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#d35447"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Summary details */}
        <motion.div
          className={styles.bottomArea}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <h3 className={styles.sectionTitle}>Financial Summary</h3>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Total Revenue</div>
              <div className={styles.summaryValue}>
                $
                {(
                  data?.summary?.total_revenue ??
                  mockResponse.summary.total_revenue
                ).toLocaleString()}
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Total Expenses</div>
              <div className={styles.summaryValue}>
                $
                {(
                  data?.summary?.total_expenses ??
                  mockResponse.summary.total_expenses
                ).toLocaleString()}
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Net Profit</div>
              <div className={styles.summaryValue}>
                $
                {(
                  data?.summary?.net_profit ?? mockResponse.summary.net_profit
                ).toLocaleString()}
              </div>
            </div>
          </div>

          {/* breakdown list */}
          <div className={styles.breakdownList}>
            {breakdown.length === 0 ? (
              <div className={styles.empty}>No breakdown available</div>
            ) : (
              breakdown.map((row) => (
                <div key={row.period} className={styles.breakRow}>
                  <div className={styles.breakPeriod}>{row.period}</div>
                  <div className={styles.breakNumbers}>
                    <div className={styles.breakRev}>
                      Revenue: ${row.revenue?.toLocaleString()}
                    </div>
                    <div className={styles.breakExp}>
                      Expenses: ${row.expenses?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
