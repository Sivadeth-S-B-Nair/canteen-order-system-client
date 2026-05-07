"use client";

import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", description: "Pay via UPI ID or QR code" },
  {
    id: "card",
    label: "Credit/Debit Card",
    description: "Visa, Mastercard, RuPay",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "Paytm, Phonepe, Amazon Pay",
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [selectedMethod, setSelectedMethod] = useState(null);

  const [stage, setStage] = useState("idle");
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    if (!orderId) {
      router.replace("/user/menu");
    }
  }, [orderId, router]);

  const handlePay = async () => {
    if (!selectedMethod) return;

    setStage("processing");
    setError(null);

    try {
      const res = await api.post(`/api/payments/${orderId}/process`, {
        method: selectedMethod,
      });
      const { paymentSuccess, payment } = res.data.data;
      setPaymentResult(payment);
      if (paymentSuccess) {
        setStage("success");
      } else {
        setStage("failed");
      }
      console.log(res)
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again",
      );
      setStage("idle");
    }
  };

  const handleRetry = async () => {
    try {
      await api.post(`/api/payments/${orderId}/retry`);
      setStage("idle");
      setSelectedMethod(null);
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
            Processing payment...
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Communicating with{" "}
            {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}.
            Please wait
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
          <p>
            ${parseFloat(amount).toFixed(2)} paid via{" "}
            {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
          </p>
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
            We couldn't process your payment. Please try again
          </p>
          <button
            onClick={handleRetry}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Try Again
          </button>
          <button onClick={()=>router.push("/user/menu")} className="mt-3 w-full text-gray-500 text-sm hover:text-gray-700"> Cancel and go back to menu</button>
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
            ${amount ? parseFloat(amount).toFixed(2) : "0.00"}
          </span>
        </div>

        <p className="text-sm font-medium text-gray-700 mb-3">
          Select payment method
        </p>
        <div className="space-y-3 mb-6">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${selectedMethod === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
            >
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${selectedMethod === method.id ? "text-blue-700" : "text-gray-800"}`}
                >
                  {method.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {method.description}
                </p>
              </div>
              {selectedMethod === method.id && (
                <svg
                  className="w-5 h-5 text-blue-600 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <button
          onClick={handlePay}
          disabled={!selectedMethod}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Pay ${amount ? parseFloat(amount).toFixed(2) : 0.0}
        </button>
        <button
          onClick={() => router.push("/user/menu")}
          className="mt-3 w-full text-gray-400 text-sm hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
