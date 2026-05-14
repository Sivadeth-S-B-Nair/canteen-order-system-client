"use client"

import api from "@/lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RestaurantAdminStaffPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/restaurant/staff", form);
      toast.success(`Staff account created for ${form.email}`);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create staff account",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6  ">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add kitchen staff to your account
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-6">
          Create Kitchen Staff Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creatinf" : "Create Staff Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
