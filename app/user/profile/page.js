"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import {
  setProfile,
  setProfileLoading,
  setProfileError,
  upsertAddress,
  removeAddress,
} from "@/store/slices/profileSlice";
import AddressModal from "@/components/features/AddressModal";
import { profileSchema } from "@/lib/validations";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(address.id);
    } finally {
      setDeleting(false);
    }
  };

  const LABEL_COLORS = {
    Home: "bg-blue-50 text-blue-700",
    Work: "bg-purple-50 text-purple-700",
    Hostel: "bg-amber-50 text-amber-700",
    Other: "bg-gray-100 text-gray-600",
  };
  const labelColor = LABEL_COLORS[address.label] || LABEL_COLORS.Other;

  return (
    <div
      className={`relative bg-white rounded-xl border-2 p-5 transition-all
        ${address.isDefault ? "border-blue-500 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}
    >
      {/* Default badge */}
      {address.isDefault && (
        <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
          Default
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${labelColor}`}
          >
            {address.label}
          </span>
          <p className="text-sm text-gray-800 font-medium leading-snug">
            {address.addressLine}
          </p>
          {(address.city || address.state || address.pincode) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {[address.city, address.state, address.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          {address.phone && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {address.phone}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(address)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Edit
        </button>
        {!address.isDefault && (
          <>
            <span className="text-gray-200">·</span>
            <button
              onClick={() => onSetDefault(address.id)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Set default
            </button>
          </>
        )}
        <span className="text-gray-200">·</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);
  const { accessToken } = useSelector((state) => state.auth);

  const [editingInfo, setEditingInfo] = useState(false);
  const [addressModal, setAddressModal] = useState({
    open: false,
    initial: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    const fetch = async () => {
      dispatch(setProfileLoading());
      try {
        const res = await api.get("/api/profile");
        dispatch(setProfile(res.data.data));
      } catch (err) {
        dispatch(
          setProfileError(
            err.response?.data?.message || "Failed to load profile",
          ),
        );
      }
    };
    fetch();
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        phone: profile.profile?.phone || "",
      });
    }
  }, [profile, reset]);

  const handleSaveInfo = async (data) => {
    try {
      const res = await api.put("/api/profile", data);
      dispatch(setProfile(res.data.data));
      toast.success("Profile updated");
      setEditingInfo(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleCancelEdit = () => {
    reset({
      name: profile?.name || "",
      phone: profile?.profile?.phone || "",
    });
    setEditingInfo(false);
  };

  const handleAddAddress = async (data) => {
    try {
      const res = await api.post("/api/profile/addresses", data);
      dispatch(upsertAddress(res.data.data));
      toast.success("Address added");
      setAddressModal({ open: false, initial: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address");
      throw err; // keep modal open
    }
  };

  const handleEditAddress = async (data) => {
    const id = addressModal.initial?.id;
    try {
      const res = await api.put(`/api/profile/addresses/${id}`, data);
      dispatch(upsertAddress(res.data.data));
      toast.success("Address updated");
      setAddressModal({ open: false, initial: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update address");
      throw err;
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/api/profile/addresses/${id}`);
      dispatch(removeAddress(id));
      toast.success("Address removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.put(`/api/profile/addresses/${id}`, {
        isDefault: true,
      });
      // Refresh the full profile so all isDefault flags are correct
      const profileRes = await api.get("/api/profile");
      dispatch(setProfile(profileRes.data.data));
      toast.success("Default address updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const addresses = profile?.addresses || [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your personal information and delivery addresses
        </p>
      </div>

      {/* ── Basic info card ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Personal Information</h2>
          {!editingInfo && (
            <button
              onClick={() => setEditingInfo(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {editingInfo ? (
            <form
              onSubmit={handleSubmit(handleSaveInfo)}
              noValidate
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
                    ${errors.name ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="+91 98765 43210"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
                    ${errors.phone ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                />
                <FieldError message={errors.phone?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-gray-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4">
              <InfoRow label="Full Name" value={profile?.name} />
              <InfoRow label="Email" value={profile?.email} />
              <InfoRow
                label="Phone"
                value={profile?.profile?.phone}
                empty="Not added yet — click Edit to add"
              />
            </dl>
          )}
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Saved Addresses</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Each address can have its own contact number
            </p>
          </div>
          <button
            onClick={() => setAddressModal({ open: true, initial: null })}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add
          </button>
        </div>

        <div className="px-6 py-5">
          {addresses.length === 0 ? (
            <div className="text-center py-10">
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No addresses saved yet</p>
              <button
                onClick={() => setAddressModal({ open: true, initial: null })}
                className="text-blue-600 text-sm mt-2 hover:underline"
              >
                Add your first address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={(a) => setAddressModal({ open: true, initial: a })}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <AddressModal
        open={addressModal.open}
        onClose={() => setAddressModal({ open: false, initial: null })}
        onSubmit={addressModal.initial ? handleEditAddress : handleAddAddress}
        initial={addressModal.initial}
      />
    </div>
  );
}

function InfoRow({ label, value, empty }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <dt className="text-sm text-gray-400 w-28 shrink-0">{label}</dt>
      <dd
        className={`text-sm mt-0.5 sm:mt-0 ${value ? "text-gray-800 font-medium" : "text-gray-400 italic"}`}
      >
        {value || empty || "—"}
      </dd>
    </div>
  );
}
