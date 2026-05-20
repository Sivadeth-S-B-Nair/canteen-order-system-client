"use client";

// app/super-admin/restaurants/page.js
//
// Changes from original:
//   1. Added Link import from "next/link"
//   2. Table rows now wrap in <Link> to /super-admin/restaurants/[id]
//   3. Everything else is identical to the original

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  restaurantSchema,
  restaurantDefault,
  restaurantAdminSchema,
  restaurantAdminDefault,
} from "@/lib/validations";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function SuperAdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const {
    register: registerR,
    handleSubmit: handleSubmitR,
    reset: resetR,
    formState: { errors: errorsR, isSubmitting: isSubmittingR },
  } = useForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues: restaurantDefault,
    mode: "onTouched",
  });

  const {
    register: registerA,
    handleSubmit: handleSubmitA,
    reset: resetA,
    formState: { errors: errorsA, isSubmitting: isSubmittingA },
  } = useForm({
    resolver: zodResolver(restaurantAdminSchema),
    defaultValues: restaurantAdminDefault,
    mode: "onTouched",
  });

  const rejectNonAlphaOnName = (e) => {
    const allowed = /^[a-zA-Z\s'"-]$/;
    const controlKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!allowed.test(e.key)) e.preventDefault();
  };

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

  const onCreateRestaurant = async (data) => {
    try {
      const res = await api.post("/api/admin/restaurants", data);
      setRestaurants((prev) => [...prev, res.data.data]);
      resetR();
      toast.success(`Restaurant "${res.data.data.name}" created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    }
  };

  const onCreateAdmin = async (data) => {
    try {
      const res = await api.post("/api/admin/restaurant-admins", {
        ...data,
        restaurantId: parseInt(data.restaurantId, 10),
      });
      resetA();
      if (res.data.emailSent) {
        toast.success(`Admin account created and credentials emailed to ${data.email}`);
      } else {
        toast(`Account created for ${data.email} but the welcome email failed.`, {
          duration: 8000,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Restaurants</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create restaurants and assign their admins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Restaurant form — unchanged */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add New Restaurant</h2>
          <form onSubmit={handleSubmitR(onCreateRestaurant)} className="space-y-3" noValidate>
            <div>
              <label className="block text-sm font-medium mb-1">Restaurant Name</label>
              <input
                type="text"
                {...registerR("name")}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                  ${errorsR.name ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
              />
              <FieldError message={errorsR.name?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                {...registerR("location")}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                  ${errorsR.location ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
              />
              <FieldError message={errorsR.location?.message} />
            </div>
            <button
              type="submit"
              disabled={isSubmittingR}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmittingR ? "Creating..." : "Create Restaurant"}
            </button>
          </form>
        </div>

        {/* Create Admin form — unchanged */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Create Restaurant Admin
            <span className="text-xs text-gray-400 font-normal ml-2">
              Credentials will be emailed automatically
            </span>
          </h2>
          <form onSubmit={handleSubmitA(onCreateAdmin)} className="space-y-3" noValidate>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                {...registerA("name")}
                onKeyDown={rejectNonAlphaOnName}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                  ${errorsA.name ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
              />
              <FieldError message={errorsA.name?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                {...registerA("email")}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                  ${errorsA.email ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
              />
              <FieldError message={errorsA.email?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  {...registerA("password")}
                  className={`w-full border rounded px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2
                    ${errorsA.password ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                  tabIndex={-1}
                >
                  {showAdminPassword ? "Hide" : "Show"}
                </button>
              </div>
              <FieldError message={errorsA.password?.message} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assign to Restaurant</label>
              <select
                {...registerA("restaurantId")}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                  ${errorsA.restaurantId ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
              >
                <option value="">Select a restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <FieldError message={errorsA.restaurantId?.message} />
            </div>
            <button
              type="submit"
              disabled={isSubmittingA}
              className="w-full bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmittingA ? "Creating & Sending Email..." : "Create Admin & Send Credentials"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Restaurant table — rows now link to detail page ──────────────── */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-700">
            All Restaurants ({restaurants.length})
          </h2>
        </div>

        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading...</p>
        ) : restaurants.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">
            No restaurants yet. Create one above.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["ID", "Name", "Location", "Status", ""].map((h) => (
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
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-400">#{r.id}</td>
                  <td className="px-6 py-3 font-medium">{r.name}</td>
                  <td className="px-6 py-3 text-gray-500">{r.location || "—"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${r.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {/* View link — separate cell so the whole row isn't a link
                      (which would make the table hard to select text from) */}
                  <td className="px-6 py-3">
                    <Link
                      href={`/super-admin/restaurants/${r.id}`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      View →
                    </Link>
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