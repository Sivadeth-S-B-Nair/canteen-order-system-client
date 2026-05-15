"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerDefault, registerSchema } from "@/lib/validations";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}
// function PasswordStrength({ password }) {
//   if (!password) return null;

//   const checks = {
//     length: password.length >= 6,
//     hasUpper: /[A-Z]/.test(password),
//     hasNumber: /[0-9]/.test(password),
//   };

//   const passed = Object.values(checks).filter(Boolean).length;
//   const colors = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"];
//   const labels = ["", "Weak", "Fair", "Strong"];

//   return (
//     <div className="mt-1.5">
//       <div className="flex gap-1 mb-1">
//         {[1, 2, 3].map((i) => (
//           <div
//             key={i}
//             className={`h-1 flex-1 rounded-full transition-all duration-300
//               ${i <= passed ? colors[passed] : "bg-gray-200"}`}
//           />
//         ))}
//       </div>
//       <p
//         className={`text-xs ${passed === 3 ? "text-green-600" : passed >= 2 ? "text-yellow-600" : "text-red-500"}`}
//       >
//         {labels[passed] || ""}
//       </p>
//     </div>
//   );
// }

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: registerDefault,
    mode: "onTouched",
  });
  // const passwordValue = watch("password");

  const onSubmit = async (rData) => {
    setServerError(null);
    try {
      const res = await api.post("/api/auth/register", rData);
      // console.log(res.data.data);

      const { data } = await api.post("/api/auth/login", {
        email: rData.email,
        password: rData.password,
      });
      dispatch(
        setCredentials({ user: data.user, accessToken: data.accessToken }),
      );
      router.push("/user/restaurants");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed");
    }
  };
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
    const isCtrlCmd = e.ctrlKey || e.metaKey; // allow Ctrl+A, Ctrl+C, etc.

    if (!controlKeys.includes(e.key) && !isCtrlCmd && !allowed.test(e.key)) {
      e.preventDefault();
      // Optional: you could show a brief flash/tooltip here to tell the user why
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Order from canteens near you
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
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              {...register("name")}
              onKeyDown={rejectNonAlphaOnName}
              className={`w-full border rounded px-3 py-2 text-sm transition-colors
                ${errors.name ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-200"}
                focus:outline-none focus:ring-2`}
            />
            <FieldError message={errors.name?.message} />
          </div>

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
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* <PasswordStrength password={passwordValue} /> */}
            <FieldError message={errors.password?.message} />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
