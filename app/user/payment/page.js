"use client";

import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// const PAYMENT_METHODS = [
//   { id: "upi", label: "UPI", description: "Pay via UPI ID or QR code" },
//   {
//     id: "card",
//     label: "Credit/Debit Card",
//     description: "Visa, Mastercard, RuPay",
//   },
//   {
//     id: "netbanking",
//     label: "Net Banking",
//     description: "Paytm, Phonepe, Amazon Pay",
//   },
// ];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  // const [selectedMethod, setSelectedMethod] = useState(null);

  const [stage, setStage] = useState("idle"); // idle | processing | success | failed | dismissed
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (!orderId) {
      router.replace("/user/restaurants");
    }
  }, [orderId, router]);

  const handlePay = async () => {
    setStage("processing");
    setError(null);
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setError("Could not load payment gateway. Please check your connection.");
      setStage("idle");
      return;
    }
    // Step 1: Ask our backend to create a Razorpay order
    let initiateData;
    try {
      const res = await api.post(`/api/payments/${orderId}/initiate`);
      initiateData = res.data.data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not initiate payment. Please try again.",
      );
      setStage("idle");
      return;
    }

    // Step 2: Open Razorpay checkout modal
    return new Promise((resolve) => {
      const options = {
        key: initiateData.keyId,
        amount: Math.round(parseFloat(initiateData.amount) * 100),
        currency: initiateData.currency || "INR",
        name: "Canteen Order System",
        description: `Order ${orderId}`,
        order_id: initiateData.razorpayOrderId,
        handler: async (response) => {
          // Step 3: Send the three Razorpay fields to our backend for verification
          // Our backend recomputes the HMAC and only confirms the order if it matches
          try {
            const verifyRes = await api.post(
              `/api/payments/${orderId}/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            );
            setPaymentResult(verifyRes.data.data.payment);
            setStage("success");
          } catch (err) {
            setError(
              err.response?.data?.message || "Payment verification failed",
            );
            setStage("failed");
          }
          resolve();
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            setStage("dismissed");
            resolve();
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("[Razorpay] payment.failed", response.error);
      });
      rzp.open();
    });
  };

  const handleRetry = async () => {
    try {
      await api.post(`/api/payments/${orderId}/retry`);
      setStage("idle");
      setPaymentResult(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset payment");
    }
  };

  if (stage === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-lg font-semibold text-gray-800">
            Opening payment gateway...
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Complete the payment in Razorpay window
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Do not close or refresh this page
          </p>
        </div>
      </div>
    );
  }
  if (stage === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex justify-center items-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Payment Successful!
          </h2>
          <p>₹{parseFloat(amount).toFixed(2)} paid via Razorpay</p>
          {paymentResult?.transactionId && (
            <p>Txn: {paymentResult.transactionId}</p>
          )}
          <p className="text-sm text-gray-600 mt-6">
            Your order is confirmed. The kitchen is now preparing it!
          </p>
          <button
            onClick={() => router.push("/user/orders")}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Track my order
          </button>
        </div>
      </div>
    );
  }

  if (stage === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Payment Failed</h2>
          <p className="text-sm text-gray-500 mt-2">
            {error || "Payment could not be verified. Please try again"}
          </p>
          <button
            onClick={handleRetry}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/user/restaurants")}
            className="mt-3 w-full text-gray-500 text-sm hover:text-gray-700"
          >
            {" "}
            Cancel and go back to restaurant
          </button>
        </div>
      </div>
    );
  }

  if (stage === "dismissed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Payment Not Completed
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            You closed the payment window. Your order is still reserved — you
            can pay later from My Orders.
          </p>
          <button
            onClick={() => setStage("idle")}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/user/orders")}
            className="mt-3 w-full text-gray-500 text-sm hover:text-gray-700"
          >
            Pay Later from My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Complete Payment</h1>
          <p className="text-gray-500 text-sm mt-1">Order #{orderId}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex justify-between items-center">
          <span className="text-gray-600 font-medium">Amount to pay</span>
          <span className="text-2xl font-bold text-blue-600">
            ₹{amount ? parseFloat(amount).toFixed(2) : "0.00"}
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 font-medium mb-2">
            Accepted payment methods
          </p>
          <div className="flex flex-wrap gap-2">
            {["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallets"].map(
              (m) => (
                <span
                  key={m}
                  className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-600"
                >
                  {m}
                </span>
              ),
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Powered by Razorpay · 256-bit SSL secured
          </p>
        </div>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <button
          onClick={handlePay}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Pay ₹{amount ? parseFloat(amount).toFixed(2) : "0.00"} with Razorpay
        </button>
        <button
          onClick={() => router.push("/user/restaurants")}
          className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
