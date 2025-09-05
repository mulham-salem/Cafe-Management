import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaBoxes,
  FaBell,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaClipboardList,
  FaTruck,
  FaPercentage,
  FaChartBar,
  FaStar,
} from "react-icons/fa";
import styles from "./styles/SidebarToggle.module.css";
import { usePermissions } from "../context/PermissionsContext";

export default function SidebarToggle({
  initialOpen = false,
  introDurationMs = 4400,
  introDelayMs = 2000,
}) {
  const { permissions, role, loading } = usePermissions();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [hoverEdge, setHoverEdge] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [starAnimationComplete, setStarAnimationComplete] = useState(false);
  const location = useLocation();
  const effectiveRole = role;

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowIntro(true);
      setStarAnimationComplete(false); // إعادة تعيين حالة النجمة
    }, introDelayMs);
    const hideTimer = setTimeout(
      () => setShowIntro(false),
      introDelayMs + introDurationMs
    );
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [introDurationMs, introDelayMs]);

  // روابط حسب الدور (سهل التوسيع لاحقاً)
  const linksByRole = [
    {
      id: "userMgmt",
      label: "User Management",
      icon: <FaUsers />,
      to: "user-management",
      requiredPermission: "User Management",
      roles: ["employee"],
    },
    {
      id: "menuMgmt",
      label: "Menu Management",
      icon: <FaClipboardList />,
      to: "menu-management",
      requiredPermission: "Menu Management",
      roles: ["employee"],
    },
    {
      id: "invMgmt",
      label: "Inventory Management",
      icon: <FaBoxes />,
      to: "inventory-supply",
      requiredPermission: "Inventory Management",
      roles: ["supplier", "employee"],
    },
    {
      id: "supplyMgmt",
      label: "Supply Management",
      icon: <FaTruck />,
      to: "inventory-supply",
      requiredPermission: "Supply Management",
      roles: ["employee"],
    },
    {
      id: "promoMgmt",
      label: "Promotion Management",
      icon: <FaPercentage />,
      to: "promotion-management",
      requiredPermission: "Promotion Management",
      roles: ["employee"],
    },
    {
      id: "reports",
      label: "Report Dashboard",
      icon: <FaChartBar />,
      to: "reports-dashboard",
      requiredPermission: "Report Dashboard",
      roles: ["employee"],
    },
    {
      id: "mgrNot",
      label: "Manager's Notifications",
      icon: <FaBell />,
      to: "manager-notification",
      requiredPermission: "Inventory Management",
      roles: ["supplier", "employee"],
    },
  ];

  const allowedLinks = useMemo(() => {
    if (!permissions) return [];
    return linksByRole.filter((l) => {
      const roleOK = l.roles.includes(effectiveRole);
      const permOK = permissions.includes(l.requiredPermission);
      return roleOK && permOK;
    });
  }, [effectiveRole, permissions]);

  useEffect(() => {
    setIsOpen(false);
  }, [effectiveRole, location.pathname]);

  // useEffect(() => {
  //   if (permissions && permissions.length > 0) {
  //     setIsOpen(true);
  //   }
  // }, [permissions]);

  if (!role) return null;
  if (loading) return null;
  const allowedRoles = ["employee", "supplier"];
  if (!allowedRoles.includes(effectiveRole)) {
    return null;
  }
  if (!permissions || permissions.length === 0 || allowedLinks.length === 0) {
    return null;
  }

  // Framer-motion variants
  const sidebarVariants = {
    closed: {
      width: 0,
      opacity: 0,
      transition: {
        width: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.3 },
      },
    },
    open: {
      width: 240,
      opacity: 1,
      transition: {
        width: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2 },
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  };

  return (
    <>
      <div
        className="edgeWrapper"
        onMouseEnter={() => setHoverEdge(true)}
        onMouseLeave={() => setHoverEdge(false)}
      >
        <button
          className={styles.edgeButton}
          onClick={() => setIsOpen((s) => !s)}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <AnimatePresence initial={false}>
            {(hoverEdge || showIntro || isOpen) && (
              <motion.span
                key="arrow"
                initial={{ x: isOpen ? -8 : 8, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: isOpen ? -8 : 8, opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 0.7,
                }}
                className="arrowIcon"
              >
                {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* نص تعريفي قصير يظهر عند تحميل الصفحة لثواني */}
        <AnimatePresence>
          {showIntro && !isOpen && (
            <div className={styles.tipContainer}>
              {/* نجمة متحركة */}
              <motion.div
                initial={{ rotate: 0, scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{
                  duration: 1,
                  ease: "backOut",
                }}
                onAnimationComplete={() => setStarAnimationComplete(true)}
                className={styles.starIcon}
              >
                <FaStar />
              </motion.div>

              {/* نص الـ Tip يظهر بعد اكتمال حركة النجمة */}
              {starAnimationComplete && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.95 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                  }}
                  className={styles.tipBubble}
                >
                  {effectiveRole === "supplier" &&
                    permissions.includes("Inventory Management") && (
                      <>New: Inventory Access</>
                    )}
                  {effectiveRole === "employee" && (
                    <>New Permissions Available!</>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* السايدبار نفسه */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* خلفية تغطي المحتوى لإغلاق السايدبار عند النقر خارجها */}
            <motion.div
              className={styles.backdrop}
              variants={overlayVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.4 },
              }}
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              className="sidebar"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              role="navigation"
              aria-label="Extra tools"
            >
              <div className={styles.sidebarHeader}>
                <h4 className={styles.headerTitle}>Admin Tools</h4>
                <button
                  className={styles.closeSmall}
                  aria-label="Close"
                  onClick={() => setIsOpen(false)}
                >
                  <FaChevronLeft />
                </button>
              </div>

              <nav className={styles.linkList} aria-label="Tool links">
                {allowedLinks.map((l) => (
                  <Link
                    key={l.id}
                    to={l.to}
                    className={styles.linkItem}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={styles.iconWrap} aria-hidden>
                      {l.icon}
                    </span>
                    <span className={styles.linkLabel}>{l.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="footerNote">
                <small>Tip: hover the left edge to reveal the toggle.</small>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
