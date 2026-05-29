"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, resetPasswordDefault } from "@/lib/validations";
import api from "@/lib/axios";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email") || "";

  const [stage, setStage] = useState("validating"); // validating | invalid | form | success | error
  const [tokenError, setTokenError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: resetPasswordDefault,
    mode: "onTouched",
  });

  useEffect(() => {
    if (!token) {
      setTokenError(
        "No reset token found in this link. Please request a new one.",
      );
      setStage("invalid");
      return;
    }

    const validate = async () => {
      try {
        await api.get(`/api/auth/reset-password/validate?token=${token}`);
        setStage("form");
      } catch (err) {
        setTokenError(
          err.response?.data?.message ||
            "This reset link is invalid or has expired.",
        );
        setStage("invalid");
      }
    };

    validate();
  }, [token]);

  const onSubmit = async (data) => {
    setSubmitError(null);
    try {
      await api.post("/api/auth/reset-password", {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setStage("success");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to reset password. Please try again.";

      if (
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("used")
      ) {
        setTokenError(msg);
        setStage("invalid");
      } else {
        setSubmitError(msg);
      }
    }
  };

  if (stage === "validating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (stage === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-500"
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
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Link unavailable
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {tokenError ||
              "This reset link is invalid or has expired. Reset links are valid for 1 hour."}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 text-center text-sm transition-colors"
          >
            Request a new reset link
          </Link>
          <div className="mt-4">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-green-600"
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
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Password reset!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Your password has been changed. You can now log in with your new
            password.
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 text-center text-sm transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Choose a new password
        </h1>
        {emailFromUrl && (
          <p className="text-sm text-gray-500 mb-6">
            For{" "}
            <span className="font-medium text-gray-700">{emailFromUrl}</span>
          </p>
        )}
        {!emailFromUrl && (
          <p className="text-sm text-gray-500 mb-6">
            Enter a strong new password below.
          </p>
        )}

        {submitError && (
          <p className="text-red-500 text-sm mb-4 text-center">{submitError}</p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              New password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                autoComplete="new-password"
                className={`w-full border rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2
                  ${errors.newPassword ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-200"}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                tabIndex={-1}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError message={errors.newPassword?.message} />
            <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                autoComplete="new-password"
                className={`w-full border rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2
                  ${errors.confirmPassword ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-200"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
