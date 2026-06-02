"use client";

import { useDispatch } from "react-redux";
import OrderItemsList from "../ui/OrderItemsList";
import StatusBadge from "../ui/StatusBadge";
import { useState } from "react";
import api from "@/lib/axios";
import { updateOrderInList } from "@/store/slices/orderSlice";
import AssignAgentModal from "./AssignAgentModal";

const NEXT_STATUS = {
  dine_in: {
    CONFIRMED: "Cooking",
    Cooking: "Ready",
    Ready: "Picked Up",
  },
  delivery: {
    CONFIRMED: "Cooking",
    Cooking: "Ready",

    "Out for Delivery": "Delivered",
  },
};

const BUTTON_LABEL = {
  dine_in: {
    CONFIRMED: "Start Cooking",
    Cooking: "Mark Ready",
    Ready: "Mark Picked Up",
  },
  delivery: {
    CONFIRMED: "Start Cooking",
    Cooking: "Mark Ready",
  },
};

export default function KitchenOrderCard({ order }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const deliveryType = order.deliveryType || "dine_in";
  const statusMap = NEXT_STATUS[deliveryType] || NEXT_STATUS.dine_in;
  const labelMap = BUTTON_LABEL[deliveryType] || BUTTON_LABEL.dine_in;

  const nextStatus = statusMap[order.status];
  const buttonLabel = labelMap[order.status];

  const isDeliveryReadyToAssign =
    deliveryType === "delivery" && order.status === "Ready";

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(`/api/orders/${order.id}/status`, {
        status: nextStatus,
      });
      dispatch(updateOrderInList(res.data.data));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAssigned = (updatedOrder) => {
    dispatch(updateOrderInList(updatedOrder));
  };

  const placedAt = new Date(order.createdAt).toLocaleString();

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-800">Order #{order.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{placedAt}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {deliveryType === "delivery" ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              🚚 Delivery
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              🍽️ Dine In
            </span>
          )}
          {order.assignedAgent && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
              🛵 {order.assignedAgent.name}
            </span>
          )}
          {order.estimatedDeliveryTime && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
              ETA{" "}
              {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <OrderItemsList orderItems={order.orderItems} />

        {order.specialInstructions &&
          order.specialInstructions.trim().length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">
                📝 Special Instructions
              </p>
              <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                {order.specialInstructions}
              </p>
            </div>
          )}

        <div className="flex justify-between border-t mt-3 pt-3 font-semibold">
          <span>Total</span>
          <span>₹{parseFloat(order.totalPrice).toFixed(2)}</span>
        </div>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

        {isDeliveryReadyToAssign && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="w-full mt-3 bg-emerald-600 text-white py-2 rounded text-sm font-medium hover:bg-emerald-700"
          >
            🛵 Assign Delivery Agent
          </button>
        )}

        {nextStatus && !isDeliveryReadyToAssign && buttonLabel && (
          <button
            onClick={handleStatusUpdate}
            disabled={loading}
            className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : buttonLabel}
          </button>
        )}
      </div>

      {showAssignModal && (
        <AssignAgentModal
          order={order}
          onClose={() => setShowAssignModal(false)}
          onAssigned={handleAssigned}
        />
      )}
    </>
  );
}
