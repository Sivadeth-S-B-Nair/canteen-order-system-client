"use client";

import api from "@/lib/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", location: "" });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/restaurants");
      setRestaurants(res.data.data);
    } catch (err) {
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };
  // console.log(restaurants);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/api/admin/restaurants", form);
      setRestaurants((prev) => [...prev, res.data.data]);
      setForm({ name: "", location: "" });
      setShowForm(false);
      toast.success(`Restaurant "${res.data.data.name}" created`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    } finally {
      setCreating(false);
    }
  };
  // console.log(restaurants);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Platform Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all restaurants on this platform
          </p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          onClick={() => setShowForm((v) => !v)}
        >
          + New Restaurant
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-blue-100"
        >
          <h2 className="font-semibold text-gray-800 mb-4">
            Create Restaurant
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
                }
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
                }
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Restaurant"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Restaurants</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {restaurants.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {restaurants.filter((r) => r.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-3xl font-bold text-gray-400 mt-1">
            {restaurants.filter((r) => !r.isActive).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["ID", "Name", "Location", "Status", "Actions"].map((h) => (
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
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No restaurants yet. Create your first one above.
                </td>
              </tr>
            ) : (
              restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {r.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {r.location || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/super-admin/restaurants?restaurantId=${r.id}&restaurantName=${encodeURIComponent(r.name)}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Manage Admin
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
