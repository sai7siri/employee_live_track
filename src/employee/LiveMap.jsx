import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import locationIcon from "../assets/loc.png";
import { useStoreContext } from "../store/ContextStore";

const MapControls = ({ coords }) => {
  const map = useMap();

  const goToUser = () => {
    if (coords) {
      map.flyTo(coords, 17);
    }
  };

  const goToOffice = () => {
    map.flyTo(OFFICE_LOCATION, 17);
  };

  return null;
};

const LiveMap = () => {
  const { OFFICE_LOCATION, coords } = useStoreContext();

  const mapRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem("user-data"));


  const arrowIcon = L.icon({
    iconUrl: locationIcon,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const officeLineIcon = L.divIcon({
    html: `<div style="
      width: 4px; 
      height: 40px; 
      background: #00050aff; 
      margin-left: 10px; 
      border-radius: 2px;
      box-shadow: 0 0 6px #e75b24ff;
    "></div>`,
    iconSize: [14, 40],
    iconAnchor: [7, 40],
    className: "",
  });

  return coords && coords ? (
    <>
      <MapContainer
        center={coords}
        zoom={17}
        scrollWheelZoom={true}
        style={{
          padding: "15px",
          borderRadius: "12px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          height: "550px",
          width: "100%",
          overflow: "hidden",
        }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Marker */}
        <Marker position={coords} icon={arrowIcon}>
          <Popup>
            You
            <br />
            <strong>{userData?.name || "Sai"}</strong>
          </Popup>
        </Marker>

        {/* Office Circle */}
        <Circle
          center={OFFICE_LOCATION}
          radius={150}
          pathOptions={{
            color: "#007bff",
            fillColor: "#80bdffff",
            fillOpacity: 0.3,
          }}
        />

        {/* Office vertical line icon */}
        <Marker position={OFFICE_LOCATION} icon={officeLineIcon}>
          <Popup>
            Office Location :
            <br />
            Pranathi Software PVT.LTD
          </Popup>
        </Marker>

        {/* Map Controls (no UI inside map) */}
        <MapControls coords={coords} />
      </MapContainer>

      {/* External Map Buttons */}
      <div className="d-flex justify-content-center gap-3 mt-3">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => mapRef.current?.flyTo(coords, 17)}
        >
          My Location
        </button>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => mapRef.current?.flyTo(OFFICE_LOCATION, 18)}
        >
          Office
        </button>
      </div>
    </>
  ) : (
    <div className="d-flex align-items-center justify-content-center h-100">
      <p className="text-center mt-5">📍 Getting your location...</p>
    </div>
  );
};

export default LiveMap;
