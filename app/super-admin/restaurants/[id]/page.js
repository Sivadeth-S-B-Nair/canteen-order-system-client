"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatusBadge from "@/components/ui/StatusBadge";
import OrderItemsList from "@/components/ui/OrderItemsList";

const RANGES = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "ytd", label: "YTD" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const fmt = (n) => currencyFormatter.format(n);

const formatXAxis = (dateStr) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  style: "currency",
  currency: "USD",
});
// Role badge — same inline badge pattern used throughout the codebase
const ROLE_LABELS = {
  restaurant_admin: {
    label: "Admin",
    className: "bg-purple-100 text-purple-700",
  },
  kitchen_staff: {
    label: "Kitchen Staff",
    className: "bg-blue-100 text-blue-700",
  },
};


function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ChartSkeleton({ height = 200 }) {
  return (
    <div className="bg-gray-100 rounded-lg animate-pulse" style={{ height }} />
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">
        {new Date(label + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {fmt(entry.value)}
        </p>
      ))}
      <p className="text-gray-400 text-xs mt-1">
        {payload[0]?.payload.orderCount} orders
      </p>
    </div>
  );
}

function KpiCard({ label, value, sub, color, loading }) {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-500",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      {loading ? (
        <div className="h-9 w-28 bg-gray-100 animate-pulse rounded mt-2" />
      ) : (
        <p
          className={`text-3xl font-bold mt-1 ${colors[color] ?? "text-gray-800"}`}
        >
          {value}
        </p>
      )}
      {sub && !loading && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [range, setRange] = useState("7d");
  const [trend, setTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [revStats, setRevStats] = useState(null);
  const [revLoading, setRevLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        const res = await api.get(`/api/admin/restaurants/${id}/summary`);
        setSummary(res.data.data);
      } catch (err) {
        setSummaryError(
          err.response?.data?.message || "Failed to load restaurant data",
        );
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [id]);

  // Fetch revenue data whenever range changes.
  // These reuse the analytics endpoints — the restaurantId param scopes
  // the SQL to this restaurant only. No new backend work needed.
  useEffect(() => {
    const fetchRevenue = async () => {
      setTrendLoading(true);
      setRevLoading(true);

      const [trendRes, statsRes] = await Promise.allSettled([
        api.get(
          `/api/analytics/revenue-trend?range=${range}&restaurantId=${id}`,
        ),
        api.get(`/api/analytics/summary?range=${range}&restaurantId=${id}`),
      ]);

      if (trendRes.status === "fulfilled") {
        setTrend(trendRes.value.data.data);
      }
      setTrendLoading(false);

      if (statsRes.status === "fulfilled") {
        setRevStats(statsRes.value.data.data);
      }
      setRevLoading(false);
    };
    fetchRevenue();
  }, [id, range]);

  // ── Loading / error states ────────────────────────────────────────────────

  if (summaryLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-4 w-32 bg-gray-100 animate-pulse rounded mb-4" />
          <div className="h-8 w-64 bg-gray-100 animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-gray-100 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 w-24 bg-gray-100 animate-pulse rounded mb-3" />
              <div className="h-9 w-20 bg-gray-100 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{summaryError}</p>
        <button
          onClick={() => router.push("/super-admin/restaurants")}
          className="text-blue-600 text-sm hover:underline"
        >
          ← Back to restaurants
        </button>
      </div>
    );
  }

  const { restaurant, stats, staff, recentOrders } = summary;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/super-admin/restaurants"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3 w-fit"
        >
          ← All Restaurants
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {restaurant.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {restaurant.location  || "No location set"}
            </p>
          </div>
          {/* Active/Inactive badge — same pattern as restaurants list page */}
          <span
            className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold shrink-0
              ${
                restaurant.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
          >
            {restaurant.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* ── All-time stat cards ──────────────────────────────────────────── */}
      {/* These never change with range — they're lifetime totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Menu Items"
          value={stats.menuCount.toLocaleString()}
          sub="Currently available"
          color="blue"
          loading={false}
        />
        <KpiCard
          label="Staff Members"
          value={stats.staffCount.toLocaleString()}
          sub="Admins + kitchen staff"
          color="purple"
          loading={false}
        />
        <KpiCard
          label="Total Orders"
          value={stats.orderCount.toLocaleString()}
          sub="All confirmed orders"
          color="orange"
          loading={false}
        />
        <KpiCard
          label="Lifetime Revenue"
          value={fmt(stats.totalRevenue)}
          sub="From paid orders"
          color="green"
          loading={false}
        />
      </div>

      {/* ── Revenue section — range-filtered ────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Revenue</h2>
          {/* Compact range toggle — smaller than the analytics page version */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  range === r.value
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <KpiCard
            label="Gross Revenue"
            value={revStats ? fmt(revStats.grossRevenue) : "—"}
            color="blue"
            loading={revLoading}
          />
          <KpiCard
            label="Platform Commission"
            value={revStats ? fmt(revStats.totalCommission) : "—"}
            color="green"
            loading={revLoading}
          />
          <KpiCard
            label="Paid Orders"
            value={revStats ? revStats.totalOrders.toLocaleString() : "—"}
            color="purple"
            loading={revLoading}
          />
        </div>

        <Section
          title="Revenue Trend"
          subtitle="Gross revenue for selected period"
        >
          {trendLoading ? (
            <ChartSkeleton height={200} />
          ) : trend.length === 0 || trend.every((d) => d.grossRevenue === 0) ? (
            <p className="text-center text-gray-400 py-12">
              No revenue data for this period
            </p>
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trend}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={(v) => compactFormatter.format(v)}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="grossRevenue"
                    name="Gross Revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>

      {/* ── Staff + Recent Orders side by side on wide screens ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff list */}
        <Section
          title="Staff"
          subtitle={`${stats.staffCount} member${stats.staffCount !== 1 ? "s" : ""}`}
        >
          {staff.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No staff assigned yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Name", "Email", "Role"].map((h) => (
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
                  {staff.map((member) => {
                    const badge = ROLE_LABELS[member.role] ?? {
                      label: member.role,
                      className: "bg-gray-100 text-gray-600",
                    };  
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {member.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 truncate max-w-40">
                          {member.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Recent orders */}
        <Section title="Recent Orders" subtitle="Last 5 confirmed orders">
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Order #{order.id}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  {/* Reuses the existing OrderItemsList component */}
                  <OrderItemsList orderItems={order.orderItems} />
                  <div className="flex justify-between border-t border-gray-100 mt-3 pt-3 text-sm font-semibold text-gray-800">
                    <span>Total</span>
                    <span>{fmt(parseFloat(order.totalPrice))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
