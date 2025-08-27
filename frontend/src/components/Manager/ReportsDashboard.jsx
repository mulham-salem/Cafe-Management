import React, { useState, lazy, Suspense, useCallback } from "react";
import styles from "../styles/ReportsDashboard.module.css";
import { motion } from "framer-motion";

const SalesReport = lazy(() => import("./Report/SalesReport"));
const FinanceReport = lazy(() => import("./Report/FinanceReport"));

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState(""); // default tab
  const [loadedTabs, setLoadedTabs] = useState(new Set([""])); // tracks which tabs were requested

  const openTab = useCallback((tabId) => {
    setActiveTab(tabId);
    setLoadedTabs((prev) => {
      if (prev.has(tabId)) return prev;
      const copy = new Set(prev);
      copy.add(tabId);
      return copy;
    });
  }, []);

  const reports = [
    {
      id: "sales",
      icon: "📊",
      title: "Sales Report",
      description: "Track sales performance and daily trends.",
      colorClass: styles.salesCard,
    },
    {
      id: "finance",
      icon: "💰",
      title: "Finance Report",
      description: "View financial summaries and monthly insights.",
      colorClass: styles.financeCard,
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <motion.section
      className={`dashboard ${styles.fullHeight}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className={styles.title}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Reports
      </motion.h1>

      <motion.p
        className={styles.subtitle}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        Select a report type to explore details.
      </motion.p>

      <div className={styles.grid}>
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            className={`${styles.card} ${report.colorClass}`}
            onClick={() => openTab(report.id)}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={styles.icon}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: {
                  type: "tween",
                  duration: 0.2,
                },
              }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
            >
              {report.icon}
            </motion.div>
            <h2 className={styles.cardTitle}>{report.title}</h2>
            <p className={styles.cardDescription}>{report.description}</p>
          </motion.div>
        ))}
      </div>

      {/* ====== TAB CONTENT AREA ====== */}
      <div className={styles.tabContentArea}>
        <Suspense
          fallback={
            <div className={styles.suspenseFallback}>Loading report...</div>
          }
        >
          {/* Sales tab (mounted if requested) */}
          {loadedTabs.has("sales") && (
            <div
              className={activeTab === "sales" ? styles.visible : styles.hidden}
              aria-hidden={activeTab !== "sales"}
            >
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={
                  activeTab === "sales" ? { opacity: 1, x: 0 } : { opacity: 0 }
                }
                transition={{ duration: 0.35 }}
                style={{ height: "100%" }}
              >
                <SalesReport />
              </motion.div>
            </div>
          )}

          {/* Finance tab */}
          {loadedTabs.has("finance") && (
            <div
              className={
                activeTab === "finance" ? styles.visible : styles.hidden
              }
              aria-hidden={activeTab !== "finance"}
            >
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={
                  activeTab === "finance"
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.35 }}
                style={{ height: "100%" }}
              >
                <FinanceReport />
              </motion.div>
            </div>
          )}
        </Suspense>
      </div>
    </motion.section>
  );
};

export default ReportsDashboard;
