"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginDefault, loginSchema } from "@/lib/validations";

const ROLE_HOME = {
  super_admin: "/super-admin/dashboard",
  restaurant_admin: "/restaurant-admin/dashboard",
  kitchen_staff: "/kitchen/orders",
  user: "/user/restaurants",
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  // const [form, setForm] = useState({
  //   email: "",
  //   password: "",
  // });
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  // const handleChange = (e) => {
  //   setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  // };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefault,
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    setServerError(null);

    try {
      const res = await api.post("/api/auth/login", data);
      // console.log(res);
      dispatch(
        setCredentials({
          user: res.data.user,
          accessToken: res.data.accessToken,
        }),
      );
      const home = ROLE_HOME[res.data.user.role] || "/login";
      router.push(home);
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {serverError && (
          <p className="text-red-500 text-sm mb-4 text-center">{serverError}</p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full border rounded px-3 py-2 text-sm transition-colors
                ${errors.email ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-200"}
                focus:outline-none focus:ring-2`}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full border rounded px-3 py-2 pr-10 text-sm transition-colors
                  ${errors.password ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-200"}
                  focus:outline-none focus:ring-2`}
              />
              <button
                type="button" // CRITICAL: without type="button" this submits the form
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                tabIndex={-1} // Don't include in tab order — screen readers handle this separately
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
            {isSubmitting ? "Logging in" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
