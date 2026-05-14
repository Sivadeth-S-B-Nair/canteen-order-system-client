"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EMPTY_RESTAURANT_FORM = { name: "", location: "" };
const EMPTY_ADMIN_FORM      = { name: "", email: "", password: "", restaurantId: "" };

export default function SuperAdminRestaurantsPage() {
  const [restaurants, setRestaurants]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [rForm, setRForm]                     = useState(EMPTY_RESTAURANT_FORM);
  const [rSubmitting, setRSubmitting]         = useState(false);
  const [aForm, setAForm]                     = useState(EMPTY_ADMIN_FORM);
  const [aSubmitting, setASubmitting]         = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get("/api/admin/restaurants");
      setRestaurants(res.data.data);
    } catch (err) {
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };


  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setRSubmitting(true);
    try {
      const res = await api.post("/api/admin/restaurants", rForm);
      setRestaurants((prev) => [...prev, res.data.data]);
      setRForm(EMPTY_RESTAURANT_FORM);
      toast.success(`Restaurant "${res.data.data.name}" created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    } finally {
      setRSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setASubmitting(true);
    try {
      const res = await api.post("/api/admin/restaurant-admins", {
        ...aForm,
        restaurantId: parseInt(aForm.restaurantId, 10),
      });
      setAForm(EMPTY_ADMIN_FORM);


      if (res.data.emailSent) {
        toast.success(`Admin account created and credentials emailed to ${aForm.email}`);
      } else {
        toast(
          `Account created for ${aForm.email} but the welcome email failed. Share credentials manually.`,
          { icon: "⚠️", duration: 8000 }
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setASubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Restaurants</h1>
        <p className="text-gray-500 text-sm mt-1">Create restaurants and assign their admins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add New Restaurant</h2>
          <form onSubmit={handleCreateRestaurant} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Restaurant Name</label>
              <input
                type="text"
                value={rForm.name}
                onChange={(e) => setRForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={rForm.location}
                onChange={(e) => setRForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={rSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {rSubmitting ? "Creating..." : "Create Restaurant"}
            </button>
          </form>
        </div>


        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Create Restaurant Admin
            <span className="text-xs text-gray-400 font-normal ml-2">
              Credentials will be emailed automatically
            </span>
          </h2>
          <form onSubmit={handleCreateAdmin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={aForm.name}
                onChange={(e) => setAForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={aForm.email}
                onChange={(e) => setAForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="text"
                value={aForm.password}
                onChange={(e) => setAForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm font-mono"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assign to Restaurant</label>
              <select
                value={aForm.restaurantId}
                onChange={(e) => setAForm((p) => ({ ...p, restaurantId: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              >
                <option value="">Select a restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={aSubmitting}
              className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {aSubmitting ? "Creating & Sending Email..." : "Create Admin & Send Credentials"}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-700">All Restaurants ({restaurants.length})</h2>
        </div>
        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading...</p>
        ) : restaurants.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No restaurants yet. Create one above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["ID", "Name", "Location", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-400">#{r.id}</td>
                  <td className="px-6 py-3 font-medium">{r.name}</td>
                  <td className="px-6 py-3 text-gray-500">{r.location || "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}