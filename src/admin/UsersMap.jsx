import React, { useRef, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useStoreContext } from "../store/ContextStore";
import "leaflet/dist/leaflet.css";
import loc from "../assets/loc.png";

// Office Icon
const officeIcon = L.divIcon({
  html: `<div style="
    width: 4px;
    height: 40px;
    background: #a70000ff;
    border-radius: 2px;
    box-shadow: 0 0 6px #ca0000ff;"></div>`,
  iconSize: [10, 40],
  iconAnchor: [5, 40],
  className: "",
});

// User Icon
const userIcon = new L.Icon({
  iconUrl: loc,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// Haversine Distance Function
const getDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Generate footsteps every 10m (up to max 100m)
const generateFootsteps = (start, end, totalDistance) => {
  const steps = [];
  const stepGap = 9; // meters between steps
  const maxDistance = 100;

  const deltaLat = end.lat - start.lat;
  const deltaLng = end.lng - start.lng;
  const angle = (Math.atan2(deltaLng, deltaLat) * 180) / Math.PI;

  const stepCount = Math.min(
    Math.floor(maxDistance / stepGap),
    Math.floor(totalDistance / stepGap)
  );

  for (let i = 1; i <= stepCount; i++) {
    const ratio = (i * stepGap) / totalDistance;
    const lat = start.lat + deltaLat * ratio;
    const lng = start.lng + deltaLng * ratio;
    steps.push({ lat, lng, angle });
  }

  return steps;
};

// Map Fly Helper
const MapFlyTo = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 17);
  }, [coords]);
  return null;
};

const UsersMap = () => {
  const { OFFICE_LOCATION, users, selectedUser } = useStoreContext();
  const mapRef = useRef();
  const [pathPoints, setPathPoints] = useState([]);

  const user = selectedUser || users[0];

  useEffect(() => {
    const fetchPath = async () => {
      if (!user?.id) return;
      const logRef = collection(db, "usersCheckins", user.id, "locationLogs");

      const q = query(logRef, orderBy("timestamp"));

      const snapshot = await getDocs(q);

      const points = snapshot.docs.map((doc) => {
        const data = doc.data();
        return [data.lat, data.lng];
      });
      setPathPoints(points);
    };

    fetchPath();
  }, [user]);

  // console.log(pathPoints)

  const distance = user?.coords
    ? getDistance(
        OFFICE_LOCATION.lat,
        OFFICE_LOCATION.lng,
        user.coords.lat,
        user.coords.lng
      )
    : 0;

  if (!user?.coords) {
    return <div className="text-center mt-4">📍 Loading user location...</div>;
  }

  return (
    <>
      <MapContainer
        center={OFFICE_LOCATION}
        zoom={17}
        scrollWheelZoom={true}
        ref={mapRef}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          marginBottom: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Office Marker */}
        <Marker position={OFFICE_LOCATION} icon={officeIcon}>
          <Popup>
            🏢 <strong>Office</strong>
            <br />
            Pranathi Software Pvt. Ltd
          </Popup>
        </Marker>

        {/* Office 100m Circle */}
        <Circle
          center={OFFICE_LOCATION}
          radius={125}
          pathOptions={{
            color: "#007bff",
            fillColor: "#cce5ff",
            fillOpacity: 0.3,
          }}
        />

        {/* User Marker */}
        <Marker position={user.coords} icon={userIcon}>
          <Popup>
            Employee : <strong>{user.name}</strong>
            <br />
            Distance: {Math.round(distance)} meters
          </Popup>
        </Marker>

        {/* Footstep Polyline from office to 100m point (optional dotted line) */}
        {pathPoints.length > 1 && (
          <Polyline
            positions={pathPoints}
            pathOptions={{
              color: "#030303ff",
              weight: 3,
              dashArray: "4 9",
              opacity: 0.8,
            }}
          />
        )}

        <MapFlyTo coords={user.coords} />
      </MapContainer>

      {/* Buttons */}
      <div className="d-flex justify-content-center gap-3 mb-3">
        <button
          className="btn btn-success"
          onClick={() => mapRef.current?.flyTo(user.coords, 17)}
        >
          View {user.name}'s Location
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => mapRef.current?.flyTo(OFFICE_LOCATION, 17)}
        >
          View Office
        </button>
      </div>

      {/* Info below */}
      <div className="text-center">
        <h6>
          Employee : <strong>{user.name}</strong> is{" "}
          <span className="text-danger">{Math.round(distance)} meters</span>{" "}
          from the office.
        </h6>
      </div>
    </>
  );
};

export default UsersMap;
