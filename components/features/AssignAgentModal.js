"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AssignAgentModal({ order, onClose, onAssigned }) {
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get("/api/restaurant/delivery-agents");
        setAgents(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedAgentId(String(res.data.data[0].id));
        }
      } catch (err) {
        setError("Failed to load deliver agents");
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, []);

  const handleAssign = async () => {
    if (!selectedAgentId) {
      setError("Please select a delivery agent");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/api/orders/${order.id}/assign-agent`, {
        agentId: parseInt(selectedAgentId, 10),
        estimatedDeliveryTime: estimatedDeliveryTime || null,
      });
      toast.success("Agent assigned - order is now out for delivery");
      onAssigned(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign agent");
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) return null;

  const totalItems = order.orderItems?.reduce((s, i) => s + i.qty, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Assign Delivery Agent
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Order #{order.id} · {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {order.deliveryAddress && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-0.5">Delivery to:</p>
            <p>{order.deliveryAddress.addressLine}</p>
            {order.deliveryAddress.city && (
              <p className="text-gray-500">
                {[order.deliveryAddress.city, order.deliveryAddress.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Agent
          </label>
          {loadingAgents ? (
            <p className="text-sm text-gray-400">Loading agents...</p>
          ) : agents.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              No delivery agents found.{" "}
              <a
                href="/restaurant-admin/agents"
                className="underline font-medium hover:text-amber-900"
              >
                Add one first →
              </a>
            </div>
          ) : (
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={String(agent.id)}>
                  {agent.name} — {agent.email}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Delivery Time
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={estimatedDeliveryTime}
            onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <p className="text-xs text-gray-400 mt-1">
            Visible to the customer on their order tracking page
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleAssign}
            disabled={submitting || agents.length === 0}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Assigning..." : "Assign & Dispatch"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
