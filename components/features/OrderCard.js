"use client";
import { useRouter } from "next/navigation";
import OrderItemsList from "../ui/OrderItemsList";
import StatusBadge from "../ui/StatusBadge";
import { useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import RatingModal from "./RatingModal";
import { useDispatch } from "react-redux";
import { cancelOrderInList } from "@/store/slices/orderSlice";


function CancelOrderModal({ order, onClose, onCancelled }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const willGetRefund = order.status === "CONFIRMED";

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/orders/${order.id}/cancel`, {
        cancellationReason: reason.trim() || null,
      });
      onCancelled(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Cancel order #{order.id}?
        </h2>

        {willGetRefund ? (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <p className="font-medium">This order was already paid.</p>
            <p className="mt-1">
              Cancelling will submit a refund request of{" "}
              <strong>₹{parseFloat(order.totalPrice).toFixed(2)}</strong> for
              admin review. You'll receive an email when it's processed.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            This order hasn't been paid yet. Cancelling it won't create a refund
            request.
          </p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Changed my mind, ordered wrong item..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Yes, cancel order"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Keep order
          </button>
        </div>
      </div>
    </div>
  );
}

function RefundStatusBanner({ refundRequest }) {
  if (!refundRequest) {
    return (
      <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
        <p className="text-sm text-zinc-600">
          No refund required — payment was not collected.
        </p>
      </div>
    );
  }

  const config = {
    PENDING: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-800",
      icon: "⏳",
      title: "Refund request pending",
      body: `Your refund of ₹${parseFloat(refundRequest.refundAmount).toFixed(2)} is awaiting admin review.`,
    },
    APPROVED: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      icon: "✓",
      title: "Refund approved",
      body: `Your refund of ₹${parseFloat(refundRequest.refundAmount).toFixed(2)} has been approved.${
        refundRequest.razorpayRefundId
          ? ` Refund ID: ${refundRequest.razorpayRefundId}. Allow 5–7 business days.`
          : " The restaurant will process it manually."
      }`,
    },
    REJECTED: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: "✕",
      title: "Refund request rejected",
      body: refundRequest.adminNotes
        ? `Reason: ${refundRequest.adminNotes}`
        : "The restaurant did not approve this refund.",
    },
  };

  const c = config[refundRequest.status] || config.PENDING;

  return (
    <div className={`mt-3 p-3 border rounded-lg ${c.bg}`}>
      <p className={`text-sm font-semibold ${c.text}`}>
        {c.icon} {c.title}
      </p>
      <p className={`text-xs mt-1 ${c.text}`}>{c.body}</p>
    </div>
  );
}

export default function OrderCard({ order }) {
  const dispatch=useDispatch()
  const placedAt = new Date(order.createdAt).toLocaleString();
  const router = useRouter();
  const [ratingData, setRatingData] = useState(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isCancellable =
    order.status === "PAYMENT_PENDING" || order.status === "CONFIRMED";

  const handleOpenRating = async () => {
    setLoadingRating(true);
    try {
      const res = await api.get(`/api/ratings/order/${order.id}/status`);
      const data = res.data.data;
      const hasUnrated = data.items.some((i) => !i.isRated);
      if (!hasUnrated) {
        toast("You have already rated all items in this order");
        return;
      }
      setRatingData(data);
    } catch (err) {
      toast.error("Could not load rating status");
    } finally {
      setLoadingRating(false);
    }
  };

  const handleCancelled = ({ order: updatedOrder, refundRequest }) => {
    dispatch(
      cancelOrderInList({
        orderId: updatedOrder.id,
        refundRequest: refundRequest || null,
      }),
    );
    toast.success(
      refundRequest
        ? "Order cancelled. Refund request submitted."
        : "Order cancelled.",
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-800">Order #{order.id}</p>
            <p className="text-xs text-gray-400 mt-1">{placedAt}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-2">
          {(order.deliveryType || "dine_in") === "delivery" ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              🚚 Delivery order
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              🍽️ Dine In
            </span>
          )}
        </div>

        <OrderItemsList orderItems={order.orderItems} />
        {order.specialInstructions &&
          order.specialInstructions.trim().length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Your instructions:
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {order.specialInstructions}
              </p>
            </div>
          )}
        <div className="flex justify-between border-t mt-3 pt-3 font-semibold">
          <span>Total</span>
          <span>₹{parseFloat(order.totalPrice).toFixed(2)}</span>
        </div>
        {order.status === "PAYMENT_PENDING" && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              Payment not completed
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Your order is reserved but not confirmed until payment is made.
            </p>
            <button
              onClick={() =>
                router.push(
                  `/user/payment?orderId=${order.id}&amount=${order.totalPrice}`,
                )
              }
              className="mt-2 w-full bg-red-600 text-white py-1.5 rounded text-sm font-medium hover:bg-red-700"
            >
              Complete Payment . ₹{parseFloat(order.totalPrice).toFixed(2)}
            </button>
          </div>
        )}
        {order.status === "Ready" && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              Your order is ready! Please collect it.
            </p>
          </div>
        )}
        {order.status === "Picked Up" && (
          <div className="mt-3">
            <button
              onClick={handleOpenRating}
              disabled={loadingRating}
              className="w-full border border-amber-400 text-amber-600 py-1.5 rounded text-sm font-medium hover:bg-amber-50 disabled:opacity-50"
            >
              {loadingRating ? "Loading..." : "★ Rate this order"}
            </button>
          </div>
        )}
        {order.status === "CANCELLED" && (
          <RefundStatusBanner refundRequest={order.refundRequest || null} />
        )}
        {isCancellable && (
          <div className="mt-3 border-t pt-3">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full text-red-500 border border-red-200 py-1.5 rounded text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Cancel order
            </button>
          </div>
        )}
      </div>
      {showCancelModal && (
        <CancelOrderModal
          order={order}
          onClose={() => setShowCancelModal(false)}
          onCancelled={handleCancelled}
        />
      )}
      <RatingModal
        order={ratingData}
        onClose={() => setRatingData(null)}
        onRated={() => {}}
      />
    </>
  );
}
