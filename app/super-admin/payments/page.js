"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function PaymentStatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

export default function SuperAdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.get("/api/payments", { params: { page: pageNum, limit: 20 } });
      setPayments(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page);
  }, [page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Platform Payments</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of all processed payments across all restaurants
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Payment ID", "Order ID", "Restaurant", "Amount", "Status", "Method", "Date"].map((h) => (
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
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500">#{p.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">#{p.orderId}</td>
                    <td className="px-6 py-3 text-gray-600">{p.order?.restaurant?.name || "—"}</td>
                    <td className="px-6 py-3 font-semibold text-gray-800">₹{parseFloat(p.amount).toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-500">{p.method || "Razorpay"}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Page {page} of {totalPages} — {total} total payments
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}