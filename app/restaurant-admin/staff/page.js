"use client";

import api from "@/lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema, staffDefault } from "@/lib/validations";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function RestaurantAdminStaffPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: staffDefault,
    mode: "onTouched",
  });
  const rejectNonAlphaOnName = (e) => {
    const allowed = /^[a-zA-Z\s'"-]$/;
    const controlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!allowed.test(e.key)) e.preventDefault();
  };
  const onSubmit = async (data) => {
    try {
      await api.post("/api/restaurant/staff", data);
      toast.success(`Staff account created for ${data.email}`);
      reset();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create staff account",
      );
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6  ">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add kitchen staff to your account
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-6">
          Create Kitchen Staff Account
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              {...register("name")}
              onKeyDown={rejectNonAlphaOnName}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                ${errors.name ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
            />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                ${errors.email ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full border rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2
                  ${errors.password ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-300"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Staff Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
