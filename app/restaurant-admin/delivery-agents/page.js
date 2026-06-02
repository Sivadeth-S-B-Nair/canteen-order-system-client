"use client";

import api from "@/lib/axios";
import { staffDefault, staffSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

function AgentCard({ agent }) {
  const initials = agent.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-4 hover:border-gray-200 transition-colors">
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-emerald-700">
          {initials}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{agent.name}</p>
        <p className="text-sm text-gray-500 truncate">{agent.email}</p>
      </div>
      <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
        Active
      </span>
    </div>
  );
}

export default function RestaurantAdminAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get("/api/restaurant/delivery-agents");
        setAgents(res.data.data);
      } catch (err) {
        toast.error("Failed to load delivery agents");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

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
      const res = await api.post("/api/restaurant/delivery-agent", data);
      setAgents((prev) => [...prev, res.data.data]);
      toast.success(`Delivery agent account created for ${data.email}`);
      reset();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create delivery agent account",
      );
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Delivery Agents</h1>
        <p className="text-gray-500 text-sm mt-1">
          Add and manage delivery agents for your restaurant
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-5">
            Add New Delivery Agent
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
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
              className="w-full bg-emerald-600 text-white py-2 rounded font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Agent Account"}
            </button>
          </form>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">
            All Agents
            {!loading && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({agents.length})
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading...</p>
        ) : agents.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No delivery agents yet.</p>
            <p className="text-gray-400 text-xs mt-1">
              Add your first agent using the form.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
