// app/restaurant-admin/promos/page.js
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  expiresAt: '',
  usageLimit: '',
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
        discountValue: parseFloat(form.discountValue),
        minOrderAmount:    form.minOrderAmount    ? parseFloat(form.minOrderAmount)    : null,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        expiresAt:   form.expiresAt   || null,
        usageLimit:  form.usageLimit  ? parseInt(form.usageLimit, 10) : null,
      };
      const res = await api.post('/api/promo', payload);
      toast.success(`Promo "${res.data.data.code}" created!`);
      onSaved(res.data.data);
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create promo');
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
              <p className="text-xs text-gray-400 mt-1">Automatically uppercased. Must be unique.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {form.discountType === 'percentage' ? 'Discount (%)' : 'Discount ($)'}
              </label>
              <input
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                type="number"
                min="0"
                max={form.discountType === 'percentage' ? '100' : undefined}
                step="0.01"
                placeholder={form.discountType === 'percentage' ? '10' : '50.00'}
                required
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Min Order ($)
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                name="minOrderAmount"
                value={form.minOrderAmount}
                onChange={handleChange}
                type="number" min="0" step="0.01" placeholder="e.g. 200"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {form.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Discount ($)
                  <span className="text-gray-400 font-normal ml-1">(cap)</span>
                </label>
                <input
                  name="maxDiscountAmount"
                  value={form.maxDiscountAmount}
                  onChange={handleChange}
                  type="number" min="0" step="0.01" placeholder="e.g. 100"
                  className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Expires At
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
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
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleChange}
                type="number" min="1" placeholder="Leave blank for unlimited"
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
              {saving ? 'Creating...' : 'Create Promo'}
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

function StatusBadge({ isActive, expiresAt, usageLimit, usedCount }) {
  if (!isActive) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>;
  if (expiresAt && new Date(expiresAt) < new Date()) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Expired</span>;
  if (usageLimit !== null && usedCount >= usageLimit) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">Limit reached</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
}

export default function RestaurantAdminPromosPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/promo');
        setPromos(res.data.data);
      } catch (err) {
        toast.error('Failed to load promo codes');
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
      toast.error('Failed to update promo');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promo Codes</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage discount codes for your customers</p>
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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading...</p>
        ) : promos.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400">No promo codes yet.</p>
            <button onClick={() => setShowForm(true)} className="text-blue-600 text-sm mt-2 hover:underline">
              Create your first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">{p.code}</td>
                    <td className="px-4 py-3">
                      {p.discountType === 'percentage'
                        ? `${parseFloat(p.discountValue)}%${p.maxDiscountAmount ? ` (max $${parseFloat(p.maxDiscountAmount).toFixed(0)})` : ''}`
                        : `$${parseFloat(p.discountValue).toFixed(2)} off`}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.minOrderAmount ? `$${parseFloat(p.minOrderAmount).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ' uses'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.expiresAt
                        ? new Date(p.expiresAt).toLocaleDateString()
                        : 'Never'}
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
                      <button
                        onClick={() => handleToggle(p.id)}
                        disabled={toggling === p.id}
                        className="text-blue-600 hover:underline text-sm disabled:opacity-50"
                      >
                        {toggling === p.id ? '...' : p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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