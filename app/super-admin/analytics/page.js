"use client";

import api from "@/lib/axios";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "ytd", label: "Year to date" },
];

// formatter
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

// ─── Chart-specific tooltip components  ───────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">
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

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2 truncate max-w-40">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {fmt(entry.value)}
        </p>
      ))}
    </div>
  );
}
// KEY PERFORMANCE INDICATOR
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
function ChartSkeleton({ height = 300 }) {
  return (
    <div
      className="bg-gray-100 rounded-lg animate-pulse"
      style={{ height }}
    ></div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [trend, setTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [byRestaurant, setByRestaurant] = useState([]);
  const [byRestaurantLoading, setByRestaurantLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    setSummaryLoading(true);
    setTrendLoading(true);
    setByRestaurantLoading(true);

    const [summaryRes, trendRes, byRestRes] = await Promise.allSettled([
      api.get(`/api/analytics/summary?range=${range}`),
      api.get(`/api/analytics/revenue-trend?range=${range}`),
      api.get(`/api/analytics/by-restaurant?range=${range}`),
    ]);
    if (summaryRes.status === "fulfilled") {
      setSummary(summaryRes.value.data.data);
    } else {
      setError("Failed to load summary data");
    }
    setSummaryLoading(false);
    if (trendRes.status === "fulfilled") {
      setTrend(trendRes.value.data.data);
    }
    setTrendLoading(false);
    if (byRestRes.status === "fulfilled") {
      setByRestaurant(byRestRes.value.data.data);
    }
    setByRestaurantLoading(false);
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Platform Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Revenue and order data across all restaurants
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                range === r.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r.value}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {/* PLATFORM SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Gross Revenue"
          value={summary ? fmt(summary.grossRevenue) : "-"}
          sub="Total payments collected"
          color="blue"
          loading={summaryLoading}
        />
        <KpiCard
          label="Platform Commission"
          value={summary ? fmt(summary.totalCommission) : "-"}
          sub="10% of gross revenue"
          color="green"
          loading={summaryLoading}
        />
        <KpiCard
          label="Paid Orders"
          value={summary ? summary.totalOrders.toLocaleString() : "-"}
          sub="Successfully completed"
          color="purple"
          loading={summaryLoading}
        />
        <KpiCard
          label="Active Restaurants"
          value={summary ? summary.activeRestaurants.toLocaleString() : "-"}
          sub="With atleast one paid order"
          color="orange"
          loading={summaryLoading}
        />
      </div>
      {/* REVENUE TREND (LINE CHART) */}
      <div className="mb-6">
        <Section
          title="Revenue Trend"
          subtitle="Gross revenue vs platform commission over time"
        >
          {trendLoading ? (
            <ChartSkeleton height={300} />
          ) : trend.length === 0 ? (
            <p className="text-center text-gray-400 py-16">
              No revenue data for this period
            </p>
          ) : (
            // Explicit height on the wrapper is required — ResponsiveContainer
            // reads its parent's height. Without this it renders at 0px.
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trend}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    // preserveStartEnd: always show first + last tick, Recharts
                    // decides how many in between based on available space.
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
                  <Legend
                    wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="grossRevenue"
                    name="Gross Revenue"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="commission"
                    name="Commission (10%)"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 3"
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>

      {/* REVENUE BY RESTAURANT (BAR CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="Revenue by Restaurant"
          subtitle="Gross revenue per tenant"
        >
          {byRestaurantLoading ? (
            <ChartSkeleton height={250} />
          ) : byRestaurant.length === 0 ? (
            <p className="text-gray-400 text-center py-12">
              No data for this period
            </p>
          ) : (
            <div style={{ height: 250 }}>
              <ResponsiveContainer>
                <BarChart
                  data={byRestaurant.slice(0, 8)}
                  margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="restaurantName"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) => compactFormatter.format(v)}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar
                    dataKey="grossRevenue"
                    name="Gross Revenue"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>

        <Section
          title="Restaurant Leaderboard"
          subtitle={`Sorted by gross revenue · ${RANGES.find((r) => r.value === range)?.label}`}
        >
          {byRestaurantLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : byRestaurant.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No data for this period
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Restaurant", "Orders", "Revenue", "Commission"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`py-3 text-gray-600 font-medium
                          ${h === "Restaurant" ? "text-left px-4" : "text-right px-4"}`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {byRestaurant.map((r, idx) => (
                    <tr key={r.restaurantId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Rank badge — same inline badge pattern as StatusBadge */}
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                              ${idx === 0 ? "bg-amber-100 text-amber-700" : ""}
                              ${idx === 1 ? "bg-gray-100 text-gray-500" : ""}
                              ${idx === 2 ? "bg-orange-100 text-orange-600" : ""}
                              ${idx > 2 ? "bg-gray-50 text-gray-400" : ""}
                            `}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-800 truncate max-w-32">
                            {r.restaurantName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {r.orderCount}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {fmt(r.grossRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {fmt(r.commission)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
