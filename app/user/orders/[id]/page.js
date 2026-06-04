"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import { useOrderTracking } from "@/hooks/useSocket";
import api from "@/lib/axios";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const DeliveryMap = dynamic(() => import("@/components/features/DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading map…</p>
      </div>
    </div>
  ),
});

function formatETA(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 0) return "Soon";
  if (diffMins < 60) return `~${diffMins} min`;
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return `~${h}h ${m}m`;
}

const STATUS_STEPS = [
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "Cooking", label: "Cooking" },
  { key: "Ready", label: "Ready" },
  { key: "Out for Delivery", label: "On the way" },
  { key: "Delivered", label: "Delivered" },
];

function StatusTimeline({ status }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div
            key={step.key}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${
                    active
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110"
                      : done
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
              >
                {done && !active ? "✓" : idx + 1}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap ${
                  active
                    ? "text-blue-600 font-semibold"
                    : done
                      ? "text-gray-600"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 mt-[-14px] transition-all ${
                  idx < currentIdx ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const orderId = parseInt(id, 10);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agentLocation, setAgentLocation] = useState(null);
  const [locationStale, setLocationStale] = useState(false);

  const stalenessTimer = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderRes, locationRes] = await Promise.allSettled([
          api.get("/api/orders/user"),
          api.get(`/api/orders/${orderId}/agent-location`),
        ]);
        if (orderRes.status === "fulfilled") {
          const found = orderRes.value.data.data.find((o) => o.id === orderId);
          if (!found) {
            setError("Order not found");
          } else {
            setOrder(found);
          }
        } else {
          setError("Failed to load order");
        }

        if (locationRes.status === "fulfilled" && locationRes.value.data.data) {
          setAgentLocation(locationRes.value.data.data);
        }
      } catch (err) {
        setError("Failed to load tracking data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId]);

  const handleLocationUpdate = useCallback((data) => {
    setAgentLocation(data);
    setLocationStale(false);

    if (stalenessTimer.current) clearTimeout(stalenessTimer.current);
    stalenessTimer.current = setTimeout(() => setLocationStale(true), 30000);
  }, []);

  const handleOrderUpdated = useCallback((updatedOrder) => {
    setOrder(updatedOrder);
  }, []);

  useOrderTracking(
    order?.status === "Out for Delivery" ? order.id : null,
    handleLocationUpdate,
    handleOrderUpdated
  );

  useEffect(() => {
    return () => {
      if (stalenessTimer.current) clearTimeout(stalenessTimer.current);
    };
  }, []);

  const isDelivery = order?.deliveryType === "delivery";
  const isOutForDelivery = order?.status === "Out for Delivery";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error || "Order not found"}</p>
        <Link
          href="/user/orders"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/user/orders"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3"
        >
          ← My Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Order #{order.id}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Status timeline — only for delivery orders */}
      {isDelivery && (
        <div className="bg-white rounded-xl shadow-sm p-5 overflow-x-auto">
          <StatusTimeline status={order.status} />
        </div>
      )}

      {/* Live map — show when order is out for delivery */}
      {isDelivery && isOutForDelivery && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Tracking
              </h2>
              {order.estimatedDeliveryTime && (
                <p className="text-xs text-gray-500 mt-0.5">
                  ETA: {formatETA(order.estimatedDeliveryTime)} ·{" "}
                  {new Date(order.estimatedDeliveryTime).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              )}
            </div>
            {agentLocation && (
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {order.assignedAgent?.name ?? "Agent"}
                </p>
                {locationStale && (
                  <p className="text-xs text-amber-500">Signal lost</p>
                )}
                {!locationStale && (
                  <p className="text-xs text-green-600">● Live</p>
                )}
              </div>
            )}
          </div>

          <div className="h-72 sm:h-96">
            <DeliveryMap
              agentLocation={agentLocation}
              deliveryAddress={order.deliveryAddress}
              restaurantName={order.restaurant?.name}
            />
          </div>

          {!agentLocation && (
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-xs text-amber-700">
                Waiting for agent to share their location…
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delivery address */}
      {isDelivery && order.deliveryAddress && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Delivery Address</h2>
          <p className="text-sm text-gray-700">
            {order.deliveryAddress.addressLine}
          </p>
          {order.deliveryAddress.city && (
            <p className="text-sm text-gray-500">
              {[
                order.deliveryAddress.city,
                order.deliveryAddress.state,
                order.deliveryAddress.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Items</h2>
        <ul className="space-y-2">
          {order.orderItems?.map((item) => (
            <li
              key={item.id}
              className="flex justify-between text-sm text-gray-700"
            >
              <span>
                {item.snapshotName} × {item.qty}
              </span>
              <span className="font-medium">
                ₹{(parseFloat(item.snapshotPrice) * item.qty).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-gray-800">
          <span>Total</span>
          <span>₹{parseFloat(order.totalPrice).toFixed(2)}</span>
        </div>
      </div>

      {/* Assigned agent info */}
      {order.assignedAgent && (
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-emerald-700">
              {order.assignedAgent.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {order.assignedAgent.name}
            </p>
            <p className="text-xs text-gray-500">Your delivery agent</p>
          </div>
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            🛵 On the way
          </span>
        </div>
      )}
    </div>
  );
}
