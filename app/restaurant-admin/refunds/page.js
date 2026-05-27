"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function RefundStatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

function ReviewModal({ refundRequest, decision, onClose, onReviewed }) {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isReject = decision === "REJECTED";

  const handleSubmit = async () => {
    if (isReject && !adminNotes.trim()) {
      setError("A reason is required when rejecting a refund request");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/refunds/${refundRequest.id}/review`, {
        decision,
        adminNotes: adminNotes.trim() || null,
      });
      onReviewed(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {isReject ? "Reject refund request" : "Approve refund request"}
        </h2>

        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          <p>
            <strong>Order #{refundRequest.orderId}</strong> ·{" "}
            {refundRequest.user?.name}
          </p>
          <p className="mt-0.5">
            Refund amount:{" "}
            <strong>
              ${parseFloat(refundRequest.refundAmount).toFixed(2)}
            </strong>
          </p>
          {refundRequest.cancellationReason && (
            <p className="mt-1 text-gray-500 italic">
              Customer reason: "{refundRequest.cancellationReason}"
            </p>
          )}
        </div>

        {isReject ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => {
                setAdminNotes(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Order was already prepared when cancellation was received..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 focus:ring-red-300"
                  : "focus:ring-blue-300"
              }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Refund initiated via Razorpay..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              Approving will attempt to issue the refund via Razorpay
              automatically.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
              isReject
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Submitting..."
              : isReject
                ? "Reject request"
                : "Approve & process refund"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function RefundRequestCard({ refundRequest, onReviewed }) {
  const [reviewModal, setReviewModal] = useState(null);

  const { order } = refundRequest;
  const isPending = refundRequest.status === "PENDING";

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-gray-800">
              Order #{refundRequest.orderId}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Cancelled {new Date(refundRequest.createdAt).toLocaleString()}
            </p>
          </div>
          <RefundStatusBadge status={refundRequest.status} />
        </div>

        {/* Customer */}
        <div className="text-sm text-gray-600 mb-3">
          <p>
            <span className="font-medium">Customer:</span>{" "}
            {refundRequest.user?.name} · {refundRequest.user?.email}
          </p>
          <p>
            <span className="font-medium">Refund amount:</span>{" "}
            <span className="text-green-700 font-semibold">
              ${parseFloat(refundRequest.refundAmount).toFixed(2)}
            </span>
          </p>
          {refundRequest.cancellationReason && (
            <p className="mt-1">
              <span className="font-medium">Reason:</span>{" "}
              <span className="italic text-gray-500">
                "{refundRequest.cancellationReason}"
              </span>
            </p>
          )}
        </div>

        {/* Order items (collapsed summary) */}
        {order?.orderItems && order.orderItems.length > 0 && (
          <div className="border rounded-lg p-3 mb-3 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Order items
            </p>
            <ul className="space-y-1">
              {order.orderItems.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between text-xs text-gray-600"
                >
                  <span>
                    {item.snapshotName} × {item.qty}
                  </span>
                  <span>
                    ${(parseFloat(item.snapshotPrice) * item.qty).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviewed info (non-pending) */}
        {!isPending && (
          <div className="text-xs text-gray-400 mb-3">
            {refundRequest.status === "APPROVED" ? (
              <>
                <p>
                  Approved by {refundRequest.reviewer?.name || "admin"} on{" "}
                  {new Date(refundRequest.reviewedAt).toLocaleString()}
                </p>
                {refundRequest.razorpayRefundId && (
                  <p className="mt-0.5">
                    Razorpay refund ID:{" "}
                    <code className="font-mono">
                      {refundRequest.razorpayRefundId}
                    </code>
                  </p>
                )}
                {refundRequest.razorpayRefundStatus === "API_FAILED" && (
                  <p className="text-amber-600 mt-0.5">
                    ⚠ Razorpay API call failed — please process manually.
                  </p>
                )}
                {refundRequest.razorpayRefundStatus === "MANUAL_REQUIRED" && (
                  <p className="text-amber-600 mt-0.5">
                    ⚠ No Razorpay payment found — process manually.
                  </p>
                )}
              </>
            ) : (
              <>
                <p>
                  Rejected by {refundRequest.reviewer?.name || "admin"} on{" "}
                  {new Date(refundRequest.reviewedAt).toLocaleString()}
                </p>
                {refundRequest.adminNotes && (
                  <p className="mt-0.5 text-red-500">
                    Reason: {refundRequest.adminNotes}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Action buttons (pending only) */}
        {isPending && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setReviewModal("APPROVED")}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Approve refund
            </button>
            <button
              onClick={() => setReviewModal("REJECTED")}
              className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {reviewModal && (
        <ReviewModal
          refundRequest={refundRequest}
          decision={reviewModal}
          onClose={() => setReviewModal(null)}
          onReviewed={(updated) => {
            setReviewModal(null);
            onReviewed(updated);
            toast.success(
              reviewModal === "APPROVED"
                ? "Refund approved and customer notified."
                : "Refund request rejected and customer notified.",
            );
          }}
        />
      )}
    </>
  );
}

export default function RefundsPage() {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async (status, pageNum) => {
    setLoading(true);
    try {
      const params = { page: pageNum };
      if (status) params.status = status;
      const res = await api.get("/api/refunds", { params });
      setRequests(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to load refund requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(activeTab, page);
  }, [activeTab, page]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleReviewed = (updated) => {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Refund Requests</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and process refund requests from cancelled orders
        </p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!loading && (
        <p className="text-sm text-gray-500 mb-4">
          {total} request{total !== 1 ? "s" : ""}
          {activeTab ? ` with status ${activeTab}` : ""}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-gray-400 text-lg">No refund requests</p>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === "PENDING"
              ? "All caught up! No pending requests."
              : "No requests match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <RefundRequestCard
              key={req.id}
              refundRequest={req}
              onReviewed={handleReviewed}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
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
