import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/DeliveryLocation.module.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Syria bounding box (min/max lat/lng)
const SYRIA_BOUNDS = [
  [32.0, 35.4], // Southwest
  [37.4, 42.0], // Northeast
];

// Cities with coords
const SYRIA_CITIES = [
  { name: "Damascus", lat: 33.5138, lng: 36.2765 },
  { name: "Aleppo", lat: 36.2021, lng: 37.1343 },
  { name: "Homs", lat: 34.7324, lng: 36.7138 },
  { name: "Latakia", lat: 35.5247, lng: 35.7915 },
  { name: "Hama", lat: 35.1318, lng: 36.7578 },
  { name: "Tartus", lat: 34.889, lng: 35.8866 },
  { name: "Idlib", lat: 35.9306, lng: 36.6339 },
  { name: "Deir ez-Zor", lat: 35.3333, lng: 40.15 },
  { name: "Raqqa", lat: 35.9506, lng: 39.0097 },
  { name: "Hasakah", lat: 36.4833, lng: 40.75 },
  { name: "Daraa", lat: 32.6189, lng: 36.1026 },
  { name: "Qamishli", lat: 37.05, lng: 41.2167 },
  { name: "Suwayda", lat: 32.7086, lng: 36.5694 },
];

const MAP_STYLES = {
  OSM: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  Satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  Dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const DeliveryLocation = ({ isOpen, onClose, isEditable = true }) => {
  const savedCoords = JSON.parse(localStorage.getItem("markerPosition")) || {
    lat: 33.5138,
    lng: 36.2765,
  };

  const [position, setPosition] = useState(savedCoords);
  const [mapStyle, setMapStyle] = useState("OSM");
  const [selectedCity, setSelectedCity] = useState(null);

  const handleMarkerDrag = (e) => {
    const newPos = e.target.getLatLng();
    setPosition(newPos);
    localStorage.setItem("markerPosition", JSON.stringify(newPos));
  };

  const handleCityChange = (e) => {
    const city = SYRIA_CITIES.find((c) => c.name === e.target.value);
    if (city) {
      setSelectedCity(city);
      setPosition({ lat: city.lat, lng: city.lng });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.controls}>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
          >
            {Object.keys(MAP_STYLES).map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>

          <select onChange={handleCityChange}>
            <option value="">Select City</option>
            {SYRIA_CITIES.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <MapContainer
          center={[position.lat, position.lng]}
          zoom={7}
          minZoom={6}
          maxBounds={SYRIA_BOUNDS}
          maxBoundsViscosity={1.0}
          className={styles.map}
        >
          <TileLayer url={MAP_STYLES[mapStyle]} />
          <MapController
            center={[position.lat, position.lng]}
            zoom={selectedCity ? 11 : 7}
          />
          <Marker
            position={[position.lat, position.lng]}
            draggable={isEditable}
            eventHandlers={{ dragend: handleMarkerDrag }}
          >
            <Popup>{`Lat: ${position.lat.toFixed(
              4
            )}, Lng: ${position.lng.toFixed(4)}`}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default DeliveryLocation;