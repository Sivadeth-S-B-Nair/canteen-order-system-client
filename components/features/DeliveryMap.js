"use client";
// Loaded via dynamic import in the tracking page to avoid SSR window errors.
// We use OpenStreetMap tiles (free, no API key required).

import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;

// Agent icon — animated pulsing blue dot
const agentIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
      <div style="
        position:absolute;
        width:40px;height:40px;
        border-radius:50%;
        background:rgba(37,99,235,0.15);
        animation:pulse 2s ease-in-out infinite;
      "></div>
      <div style="
        width:22px;height:22px;
        border-radius:50%;
        background:#2563eb;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(37,99,235,0.5);
        display:flex;align-items:center;justify-content:center;
        font-size:12px;
        position:relative;z-index:1;
      ">🛵</div>
    </div>
    <style>
      @keyframes pulse {
        0%,100% { transform:scale(1); opacity:0.6; }
        50% { transform:scale(1.5); opacity:0.2; }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

// Customer / destination icon
const destIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:32px;height:32px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:#ef4444;
      border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    ">
      <span style="transform:rotate(45deg);font-size:14px;">🏠</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

function MapUpdater({ agentLocation, destinationCoords }) {
  const map = useMap();
  const isFirstUpdate = useRef(true);

  useEffect(() => {
    if (!agentLocation) return;
    const latlng = [agentLocation.latitude, agentLocation.longitude];

    if (isFirstUpdate.current) {
      // On first location: fit bounds to show agent + destination if both known
      isFirstUpdate.current = false;
      if (
        destinationCoords &&
        destinationCoords.latitude &&
        destinationCoords.longitude
      ) {
        try {
          const bounds = L.latLngBounds([
            agentLatLng,
            [destinationCoords.latitude, destinationCoords.longitude],
          ]);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        } catch {
          map.setView(latlng, 15, { animate: true });
        }
      }
    } else {
      // Smooth pan on subsequent updates
      map.panTo(latlng, { animate: true, duration: 0.8 });
    }
  }, [agentLocation, map, destinationCoords]);

  return null;
}

export default function DeliveryMap({
  agentLocation,
  deliveryAddress,
  restaurantName,
}) {
  const defaultCenter = [10.8505, 76.2711];
  const defaultZoom = 13;
  const center = agentLocation
    ? [agentLocation.latitude, agentLocation.longitude]
    : defaultCenter;

  const hasDestPin =
    deliveryAddress &&
    deliveryAddress.latitude != null &&
    deliveryAddress.longitude != null;
  const destCoords = hasDestPin
    ? {
        latitude: parseFloat(deliveryAddress.latitude),
        longitude: parseFloat(deliveryAddress.longitude),
      }
    : null;
  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
      attributionControl={true}
    >
      {/* OpenStreetMap tiles — free, no API key */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Auto-pan when agent moves */}
      <MapUpdater
        agentLocation={agentLocation}
        destinationCoords={destCoords}
      />

      {/* Agent marker — animated, live */}
      {agentLocation && (
        <Marker
          position={[agentLocation.latitude, agentLocation.longitude]}
          icon={agentIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                {agentLocation.agentName ?? "Your delivery agent"}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Updated{" "}
                {agentLocation.updatedAt
                  ? new Date(agentLocation.updatedAt).toLocaleTimeString()
                  : "just now"}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Delivery destination marker — static */}
      {destCoords && (
        <Marker
          position={[destCoords.latitude, destCoords.longitude]}
          icon={destIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">Delivery address</p>
              <p className="text-gray-600 text-xs mt-0.5">
                {deliveryAddress.addressLine}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
      {!destCoords && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div className="bg-white/90 text-xs text-gray-500 px-3 py-1.5 rounded-full shadow border border-gray-200">
            Destination pin unavailable — add location when saving address
          </div>
        </div>
      )}
    </MapContainer>
  );
}
