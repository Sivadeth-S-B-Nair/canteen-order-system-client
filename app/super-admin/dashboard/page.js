"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * SuperAdminDashboard
 *
 * Shows a high-level overview of the platform:
 *   - Total restaurants (active vs inactive)
 *   - Quick links to provisioning actions
 *
 * Keeps it simple — this isn't an analytics dashboard, it's an
 * operations control panel.
 */
export default function SuperAdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/api/admin/restaurants");
        setRestaurants(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const active   = restaurants.filter((r) => r.isActive).length;
  const inactive = restaurants.length - active;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Platform Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all canteen restaurants</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Restaurants" value={restaurants.length} color="blue" />
            <StatCard label="Active"             value={active}            color="green" />
            <StatCard label="Inactive"           value={inactive}          color="gray" />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/super-admin/restaurants"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Manage Restaurants
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue  : "text-blue-600",
    green : "text-green-600",
    gray  : "text-gray-500",
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}