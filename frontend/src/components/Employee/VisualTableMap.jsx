import React, { useRef, useEffect, useState, createRef } from "react";
import Draggable from "react-draggable";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheck, FaBroom, FaClock, FaMugHot } from "react-icons/fa";
import { DoorClosed } from "lucide-react";
import styles from "../styles/VisualTableMap.module.css";

const mockTables = [
  { id: 1, number: "T1", status: "available", x: 200, y: 150, capacity: 4 },
  { id: 2, number: "T2", status: "reserved", x: 250, y: 200, capacity: 4 },
  { id: 3, number: "T3", status: "reserved", x: 200, y: 200, capacity: 4 },
  { id: 4, number: "T4", status: "cleaning", x: 450, y: 300, capacity: 4 },
  { id: 5, number: "T5", status: "available", x: 300, y: 250, capacity: 4 },
  { id: 6, number: "T6", status: "available", x: 300, y: 100, capacity: 4 },
  { id: 7, number: "T7", status: "reserved", x: 200, y: 100, capacity: 4 },
  { id: 8, number: "T8", status: "cleaning", x: 200, y: 150, capacity: 4 },
  { id: 9, number: "T9", status: "reserved", x: 100, y: 150, capacity: 4 },
  { id: 10, number: "T10", status: "reserved", x: 250, y: 100, capacity: 4 },
];

const doors = [
  { id: 1, x: 0, y: 280, width: 40, height: 80 }, // باب رئيسي
  { id: 2, x: 1462, y: 280, width: 40, height: 80 }, // باب خلفي
  { id: 3, x: 700, y: 602, width: 80, height: 40 }, // باب جانبي
];

const windows = [
  { id: 1, x: 0, y: 60, width: 35, height: 35 },
  { id: 2, x: 1474, y: 60, width: 35, height: 35 },
  { id: 3, x: 0, y: 545, width: 35, height: 35 },
  { id: 4, x: 400, y: 614, width: 35, height: 35 },
  { id: 5, x: 1100, y: 614, width: 35, height: 35 },
  { id: 6, x: 1474, y: 545, width: 35, height: 35 },
];

const bar = { x: 644, y: 0, width: 200, height: 50 };

const BASE_MAP = { width: 1512, height: 652 };
const GRID = 10;
const MAP_PADDING = 60;

function snap(value, grid) {
  return Math.round(value / grid) * grid;
}

function computeSeatOffsets(count, radius) {
  const seats = [];
  if (count <= 0) return seats;

  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    const x = Math.round(Math.cos(angle) * radius);
    const y = Math.round(Math.sin(angle) * radius);
    seats.push({ x, y });
  }
  return seats;
}

function tableSizeForCapacity(capacity = 4) {
  const cap = Math.max(1, Math.min(12, Math.round(Number(capacity) || 4)));
  if (cap <= 2) return { w: 80, h: 80, radius: 36 };
  if (cap <= 4) return { w: 110, h: 110, radius: 46 };
  if (cap <= 6) return { w: 150, h: 150, radius: 64 };
  if (cap <= 8) return { w: 180, h: 180, radius: 80 };
  return { w: 210, h: 210, radius: 96 };
}

export default function VisualTableMap({ readonly = false }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const nodeRefs = useRef({});
  const mapRef = useRef(null);
  const mapBounds = mapRef.current?.getBoundingClientRect();

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        // const res = await axios.get("/api/tables");
        // setTables(res.data);
        setTables(mockTables);
      } catch (err) {
        toast.warning("Could not load table map. Loaded mock data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  // Update table (position or status)
  const updateTable = async (id, newData) => {
    const updatedTables = tables.map((t) =>
      t.id === id ? { ...t, ...newData } : t
    );
    setTables(updatedTables);

    try {
      await axios.put(`/api/tables/${id}`, newData);
      toast.success("Changes saved");
    } catch (err) {
      toast.error("Error while saving. Please try again later.");
      // استعادة الحالة الأصلية في حالة الخطأ
      setTables(tables);
    }
  };

  const statusOptions = [
    { value: "available", label: "Available", emoji: "✅", icon: <FaCheck /> },
    { value: "reserved", label: "Reserved", emoji: "⏱️", icon: <FaClock /> },
    { value: "cleaning", label: "Cleaning", emoji: "🧹", icon: <FaBroom /> },
  ];

  const statusIconMap = {
    available: <FaCheck />,
    reserved: <FaClock />,
    cleaning: <FaBroom />,
  };

  if (loading) return <p className={styles.loading}>Loading table map...</p>;
  if (tables.length === 0)
    return <p className={styles.empty}>No table data found</p>;

  // helper لتحويل px إلى نسبة مئوية حسب BASE_MAP
  const toPctX = (x) => `${(x / BASE_MAP.width) * 100}%`;
  const toPctY = (y) => `${(y / BASE_MAP.height) * 100}%`;
  const toPctW = (w) => `${(w / BASE_MAP.width) * 100}%`;
  const toPctH = (h) => `${(h / BASE_MAP.height) * 100}%`;

  return (
    <div className={styles.map} ref={mapRef}>
      <div className={styles.floorOverlay} />

      {doors.map((door, i) => (
        <div
          key={`door-${i}`}
          className={styles.door}
          style={{
            left: toPctX(door.x),
            top: toPctY(door.y),
            width: toPctW(door.width),
            height: toPctH(door.height),
          }}
        >
          <DoorClosed className={styles.doorIcon} />
        </div>
      ))}

      {windows.map((window, i) => (
        <div
          key={`window-${i}`}
          className={styles.window}
          style={{
            left: toPctX(window.x),
            top: toPctY(window.y),
            width: toPctW(window.width),
            height: toPctH(window.height),
          }}
        >
          <img src="/Icons/window.svg" alt="window" />
        </div>
      ))}

      {bar && (
        <div
          className={styles.bar}
          style={{
            left: toPctX(bar.x),
            top: toPctY(bar.y),
            width: toPctW(bar.width),
            height: toPctH(bar.height),
          }}
        >
          <FaMugHot className={styles.barIcon} />
          <span className={styles.barLabel}>Bar</span>
        </div>
      )}

      {tables.map((table) => {
        if (!nodeRefs.current[table.id]) {
          nodeRefs.current[table.id] = createRef();
        }

        const capacity = Math.max(1, Math.min(12, Number(table.capacity) || 4));
        const size = tableSizeForCapacity(capacity);

        // convert size (px) to percentage of BASE_MAP
        const widthPct = `${(size.w / BASE_MAP.width) * 100}%`;
        const heightPct = `${(size.h / BASE_MAP.height) * 100}%`;

        const seatOffsets = computeSeatOffsets(
          capacity,
          size.radius ?? Math.floor(Math.min(widthPct, heightPct) / 2) - 18
        );

        const styleForTable = {
          width: widthPct,
          height: heightPct,
          marginLeft: `-${size.w / 2}px`,
          marginTop: `-${size.h / 2}px`,
        };

        return (
          <Draggable
            key={table.id}
            nodeRef={nodeRefs.current[table.id]}
            defaultPosition={{ x: table.x, y: table.y }}
            bounds={{
              left: MAP_PADDING,
              top: MAP_PADDING,
              right: mapBounds ? mapBounds.width - MAP_PADDING : 0,
              bottom: mapBounds ? mapBounds.height - MAP_PADDING : 0,
            }}
            grid={[GRID, GRID]}
            onStop={(e, data) => {
              if (readonly) return;
              const snappedX = snap(data.x, GRID);
              const snappedY = snap(data.y, GRID);
              updateTable(table.id, { x: snappedX, y: snappedY });
            }}
            disabled={readonly}
          >
            <div
              ref={nodeRefs.current[table.id]}
              className={`${styles.table} ${styles[table.status]}`}
              style={styleForTable}
              aria-label={`Table ${table.number}, ${capacity} seats, ${table.status}`}
            >
              <span className={styles.statusBadge} aria-hidden="true">
                {statusIconMap[table.status]}
              </span>

              <div className={styles.tableTop}>
                <span className={styles.label}>{table.number}</span>
                <small className={styles.seatCount}>{capacity}</small>
              </div>

              {seatOffsets.map((s, i) => (
                <div
                  key={i}
                  className={`${styles.seat} ${styles[table.status]}`}
                  style={{
                    transform: `translate(${s.x}px, ${s.y}px)`,
                  }}
                  aria-hidden="true"
                />
              ))}

              {!readonly ? (
                <select
                  className={styles.statusSelect}
                  value={table.status}
                  onChange={(e) =>
                    updateTable(table.id, { status: e.target.value })
                  }
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <></>
              )}
            </div>
          </Draggable>
        );
      })}
    </div>
  );
}
