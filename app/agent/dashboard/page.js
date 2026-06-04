"use client";

import OrderItemsList from "@/components/ui/OrderItemsList";
import StatusBadge from "@/components/ui/StatusBadge";
import api from "@/lib/axios";
import { connectSocket } from "@/lib/socket";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000,
};

function AccuracyBadge({ accuracy }) {
  if (!accuracy) return null;
  const isGood = accuracy < 20;
  const isFair = accuracy < 60;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isGood
          ? "bg-green-100 text-green-700"
          : isFair
            ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-700"
      }`}
    >
      {" "}
      ±{Math.round(accuracy)}m{" "}
      {isGood ? "(good)" : isFair ? "(fair)" : "(poor)"}
    </span>
  );
}

export default function AgentDashboard() {
  const { accessToken } = useSelector((state) => state.auth);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [pingCount, setPingCount] = useState(0);

  const watchIdRef = useRef(null);
  const socketRef = useRef(null);

  const fetchActiveOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/orders/my-deliveries");
      const orders = res.data.data;
      const active = orders.find((o) => o.status === "Out for Delivery");
      setActiveOrder(active || null);
    } catch (err) {
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrder();
  }, [fetchActiveOrder]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    if (!activeOrder) {
      toast.error("No active order to track");
      return;
    }
    setGpsError(null);

    const socket = connectSocket(accessToken);
    socketRef.current = socket;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentPosition({ latitude, longitude, accuracy });
        setGpsError(null);

        socket.emit("location-update", {
          latitude,
          longitude,
          orderId: activeOrder.id,
        });
        setPingCount((n) => n + 1);
      },
      (err) => {
        const messages = {
          1: "Location permission denied. Please allow location access.",
          2: "Position unavailable. Check GPS signal.",
          3: "Location request timed out. Retrying...",
        };
        setGpsError(messages[err.code] || `GPS error: ${err.message}`);
      },
      GPS_OPTIONS,
    );
    setIsTracking(true);
    toast.success("Location sharing started");
  }, [accessToken, activeOrder]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setCurrentPosition(null);
    setPingCount(0);
    toast("Location sharing stopped", { icon: "⏹️" });
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleMarkDelivered = async () => {
    if (!activeOrder) return;
    try {
      await api.patch(`/api/orders/${activeOrder.id}/delivery-status`, {
        status: "Delivered",
      });
      stopTracking();
      toast.success("Order marked as delivered");
      setActiveOrder(null);
      fetchActiveOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your active delivery
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      ) : !activeOrder ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">🛵</div>
          <h2 className="font-semibold text-gray-700 mb-1">
            No active delivery
          </h2>
          <p className="text-sm text-gray-400">
            Deliveries assigned to you will appear here
          </p>
          <button
            onClick={fetchActiveOrder}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order card */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-gray-800 text-lg">
                  Order #{activeOrder.id}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={activeOrder.status} />
            </div>

            <OrderItemsList orderItems={activeOrder.orderItems} />

            {activeOrder.deliveryAddress && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-700 mb-0.5">
                  📍 Deliver to
                </p>
                <p className="text-gray-600">
                  {activeOrder.deliveryAddress.addressLine}
                </p>
                {activeOrder.deliveryAddress.city && (
                  <p className="text-gray-500 text-xs">
                    {[
                      activeOrder.deliveryAddress.city,
                      activeOrder.deliveryAddress.state,
                      activeOrder.deliveryAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {activeOrder.deliveryAddress.phone && (
                  <p className="text-gray-500 text-xs mt-1">
                    📞 {activeOrder.deliveryAddress.phone}
                  </p>
                )}
              </div>
            )}

            {activeOrder.estimatedDeliveryTime && (
              <p className="text-xs text-gray-500 mt-2">
                ETA:{" "}
                {new Date(activeOrder.estimatedDeliveryTime).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            )}
          </div>

          {/* Location tracking card */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-1">
              Location Sharing
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Share your live location so the customer can track their delivery
            </p>

            {/* Current position readout */}
            {currentPosition && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">📡 GPS Active</span>
                  <AccuracyBadge accuracy={currentPosition.accuracy} />
                </div>
                <p className="text-blue-600 font-mono">
                  {currentPosition.latitude.toFixed(6)},{" "}
                  {currentPosition.longitude.toFixed(6)}
                </p>
                <p className="text-blue-500">
                  {pingCount} update{pingCount !== 1 ? "s" : ""} sent
                </p>
              </div>
            )}

            {gpsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠️ {gpsError}
              </div>
            )}

            {!isTracking ? (
              <button
                onClick={startTracking}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-base">📡</span>
                Start Sharing Location
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Stop Sharing Location
              </button>
            )}
          </div>

          {/* Mark delivered */}
          <button
            onClick={handleMarkDelivered}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            ✓ Mark as Delivered
          </button>
        </div>
      )}
    </div>
  );
}
