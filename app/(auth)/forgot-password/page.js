"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, forgotPasswordDefault } from "@/lib/validations";
import api from "@/lib/axios";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: forgotPasswordDefault,
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      await api.post("/api/auth/forgot-password", {
        email: data.email.trim().toLowerCase(),
      });
      setSent(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm text-center">
          {/* Email icon */}
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Check your inbox
          </h1>
          <p className="text-sm text-gray-500 mb-1">
            If <strong>{getValues("email")}</strong> is registered, we've sent a
            password reset link.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            The link expires in 1 hour. Check your spam folder if you don't see
            it.
          </p>

          <Link
            href="/login"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            ← Back to login
          </Link>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Didn't receive it?{" "}
              <button
                onClick={() => setSent(false)}
                className="text-blue-600 hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to login
        </Link>

        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {serverError && (
          <p className="text-red-500 text-sm mb-4 text-center">{serverError}</p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              type="email"
              {...register("email")}
              autoComplete="email"
              className={`w-full border rounded px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2
                ${errors.email ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-200"}`}
              placeholder="you@example.com"
            />
            <FieldError message={errors.email?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
