"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  expiresAt: "",
  usageLimit: "",
};

function PromoFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrderAmount: form.minOrderAmount
          ? parseFloat(form.minOrderAmount)
          : null,
        maxDiscountAmount: form.maxDiscountAmount
          ? parseFloat(form.maxDiscountAmount)
          : null,
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
      };
      const res = await api.post("/api/promo", payload);
      toast.success(`Promo "${res.data.data.code}" created!`);
      onSaved(res.data.data);
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create promo");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b pb-3">
          Create Promo Code
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. SAVE10"
                required
                className="w-full border rounded px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Automatically uppercased. Must be unique.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Discount Type
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {form.discountType === "percentage"
                  ? "Discount (%)"
                  : "Discount (₹)"}
              </label>
              <input
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                type="number"
                min="0"
                max={form.discountType === "percentage" ? "100" : undefined}
                step="0.01"
                placeholder={
                  form.discountType === "percentage" ? "10" : "50.00"
                }
                required
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Min Order (₹)
                <span className="text-gray-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                name="minOrderAmount"
                value={form.minOrderAmount}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 200"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {form.discountType === "percentage" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Discount (₹)
                  <span className="text-gray-400 font-normal ml-1">(cap)</span>
                </label>
                <input
                  name="maxDiscountAmount"
                  value={form.maxDiscountAmount}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 100"
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Expires At
                <span className="text-gray-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                name="expiresAt"
                value={form.expiresAt}
                onChange={handleChange}
                type="datetime-local"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Usage Limit
                <span className="text-gray-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleChange}
                type="number"
                min="1"
                placeholder="Leave blank for unlimited"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Promo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsageHistoryModal({ promo, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!promo) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/promo/${promo.id}/usage`);
        setHistory(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load usage history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [promo]);

  if (!promo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Usage History
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-mono font-semibold text-gray-700">
                {promo.code}
              </span>
              {" · "}
              {promo.usedCount} use{promo.usedCount !== 1 ? "s" : ""}
              {promo.usageLimit ? ` of ${promo.usageLimit}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Close"
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

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <p className="text-gray-500 text-sm text-center py-10">
              Loading...
            </p>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center py-10">{error}</p>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="text-center py-14">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">
                No usage recorded yet for this promo code.
              </p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  {["Order ID", "Discount Applied", "Redeemed At"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-gray-600 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">
                      #{usage.orderId}
                    </td>
                    <td className="px-6 py-3 text-green-700 font-medium">
                      − ₹{parseFloat(usage.discountApplied).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(usage.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ isActive, expiresAt, usageLimit, usedCount }) {
  if (!isActive)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        Inactive
      </span>
    );
  if (expiresAt && new Date(expiresAt) < new Date())
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
        Expired
      </span>
    );
  if (usageLimit !== null && usedCount >= usageLimit)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
        Limit reached
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      Active
    </span>
  );
}

export default function RestaurantAdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [usagePromo, setUsagePromo] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/promo");
        setPromos(res.data.data);
      } catch (err) {
        toast.error("Failed to load promo codes");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await api.patch(`/api/promo/${id}/toggle`);
      setPromos((prev) => prev.map((p) => (p.id === id ? res.data.data : p)));
    } catch (err) {
      toast.error("Failed to update promo");
    } finally {
      setToggling(null);
    }
  };
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promo Codes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage discount codes for your customers
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Create Code
        </button>
      </div>

      <PromoFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={(promo) => setPromos((prev) => [promo, ...prev])}
      />

      <UsageHistoryModal
        promo={usagePromo}
        onClose={() => setUsagePromo(null)}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading...</p>
        ) : promos.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400">No promo codes yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 text-sm mt-2 hover:underline"
            >
              Create your first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    "Code",
                    "Discount",
                    "Min Order",
                    "Usage",
                    "Expires",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-gray-600 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                      {p.code}
                    </td>
                    <td className="px-4 py-3">
                      {p.discountType === "percentage"
                        ? `${parseFloat(p.discountValue)}%${p.maxDiscountAmount ? ` (max ₹${parseFloat(p.maxDiscountAmount).toFixed(0)})` : ""}`
                        : `₹${parseFloat(p.discountValue).toFixed(2)} off`}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.minOrderAmount
                        ? `₹${parseFloat(p.minOrderAmount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.usedCount}
                      {p.usageLimit ? ` / ${p.usageLimit}` : " uses"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.expiresAt
                        ? new Date(p.expiresAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        isActive={p.isActive}
                        expiresAt={p.expiresAt}
                        usageLimit={p.usageLimit}
                        usedCount={p.usedCount}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggle(p.id)}
                          disabled={toggling === p.id}
                          className="text-blue-600 hover:underline text-sm disabled:opacity-50"
                        >
                          {toggling === p.id
                            ? "..."
                            : p.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                          onClick={() => setUsagePromo(p)}
                          className="text-gray-500 hover:text-gray-700 hover:underline text-sm"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
