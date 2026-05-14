"use client";

import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateRestaurantAdminPage() {
  const searchParams = useSearchParams();
  const prefillRestaurantId = searchParams.get("restaurantId" || "");
  const prefillRestaurantName = searchParams.get("restaurantName" || "");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    restaurantId: prefillRestaurantId,
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post("/api/admin/restaurant-admins", {
        ...form,
        restaurantId: parseInt(form.restaurantId, 10),
      });
      setResult(res.data);

      if (res.data.emailSent) {
        toast.success("Admin account created and credential emailed");
      } else {
        toast(
          "Account created but email delivery failed. Share credentials manually.",
          {
            duration: 8000,
          },
        );
      }
      setForm((prev) => ({ ...prev, name: "", email: "", password: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Restaurant Admin
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          The admin will receive their login credentials by email.
        </p>
      </div>

      {/* Success banner */}
      {result && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            result.emailSent
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <p className="font-medium text-sm">{result.message}</p>
          {!result.emailSent && (
            <div className="mt-2 text-sm bg-white/60 rounded p-3 font-mono">
              <p>Email: {result.data?.email}</p>
              <p className="text-amber-700 text-xs mt-1">
                Share these credentials securely with the admin.
              </p>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Restaurant ID
          </label>
          <input
            type="number"
            name="restaurantId"
            value={form.restaurantId||""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          {prefillRestaurantName && (
            <p className="text-xs text-gray-400 mt-1">
              Restaurant: {prefillRestaurantName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Admin Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Admin Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="text"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            required
            minLength={6}
          />
          <p className="text-xs text-gray-400 mt-1">
            This will be emailed to the admin.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting
            ? "Creating account…"
            : "Create Admin Account & Send Email"}
        </button>
      </form>

      <p className="text-center mt-4">
        <a
          href="/super-admin/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
           Back to Dashboard
        </a>
      </p>
    </div>
  );
}
