// components/features/PromoCodeInput.js
//
// Self-contained widget: input + apply button + applied state + remove.
// Parent (checkout page) reads the promo from Redux.

"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/lib/axios";
import {
  applyPromo,
  clearPromo,
  setPromoLoading,
  setPromoError,
} from "@/store/slices/promoSlice";

export default function PromoCodeInput({ restaurantId, subtotal }) {
  const dispatch = useDispatch();
  const promo = useSelector((state) => state.promo);
  const [input, setInput] = useState("");

  const handleApply = async () => {
    const code = input.trim().toUpperCase();
    if (!code) return;

    if (!restaurantId) {
      dispatch(setPromoError("Cannot apply promo: no restaurant selected"));
      return;
    }

    dispatch(setPromoLoading());
    try {
      const res = await api.post("/api/promo/validate", {
        code,
        restaurantId,
        subtotal,
      });
      dispatch(applyPromo(res.data.data));
      setInput(""); // clear input after success
    } catch (err) {
      dispatch(
        setPromoError(err.response?.data?.message || "Invalid promo code"),
      );
    }
  };

  const handleRemove = () => {
    dispatch(clearPromo());
    setInput("");
  };

  // Already applied state — show badge instead of input
  if (promo.code) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-800">
              {promo.code} applied
            </p>
            <p className="text-xs text-green-600">
              {promo.discountType === "percentage"
                ? `${promo.discountValue}% off`
                : `₹${parseFloat(promo.discountValue).toFixed(2)} off`}{" "}
              — you save ₹{parseFloat(promo.discountAmount).toFixed(2)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            // Clear previous error when user types
            if (promo.error) dispatch(setPromoError(null));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Enter promo code"
          className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 uppercase
            ${promo.error ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={promo.loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
        >
          {promo.loading ? "Checking..." : "Apply"}
        </button>
      </div>
      {promo.error && (
        <p className="text-red-500 text-xs mt-1.5">{promo.error}</p>
      )}
    </div>
  );
}
