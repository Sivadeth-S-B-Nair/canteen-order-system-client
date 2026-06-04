"use client";

import { addressDefault, addressSchema } from "@/lib/validations";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

const LABEL_OPTIONS = ["Home", "Work", "Hostel", "Other"];

//   initial     → address object to pre-fill (edit mode), or null (add mode)

export default function AddressModal({ open, onClose, onSubmit, initial }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: addressDefault,
    mode: "onTouched",
  });

  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle");
  const [geoError, setGeoError] = useState(null);

  // When switching between add/edit, reset the form with the right values
  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              label: initial.label || "Home",
              addressLine: initial.addressLine || "",
              city: initial.city || "",
              state: initial.state || "",
              pincode: initial.pincode || "",
              phone: initial.phone || "",
              isDefault: initial.isDefault || false,
            }
          : addressDefault,
      );
      if (initial?.latitude && initial?.longitude) {
        setCoords({
          latitude: parseFloat(initial.latitude),
          longitude: parseFloat(initial.longitude),
        });
        setGeoStatus("done");
      } else {
        setCoords(null);
        setGeoStatus("idle");
      }
      setGeoError(null);
    }
  }, [open, initial, reset]);

  const handleClose = () => {
    reset(addressDefault);
    setCoords(null);
    setGeoStatus("idle");
    setGeoError(null);
    onClose();
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }
    setGeoStatus("fetching");
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoStatus("done");
      },
      (err) => {
        const messages = {
          1: "Location access denied. You can still save without coordinates.",
          2: "Position unavailable. Try again or save without coordinates.",
          3: "Location request timed out. Try again.",
        };
        setGeoError(messages[err.code] || "Failed to get location.");
        setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const onFormValid = async (data) => {
    await onSubmit({
      ...data,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    });
    reset(addressDefault);
    setCoords(null);
    setGeoStatus("idle");
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <form onSubmit={handleSubmit(onFormValid)} noValidate>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2"
                >
                  {initial ? "Edit Address" : "Add New Address"}
                </DialogTitle>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {LABEL_OPTIONS.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-1.5 cursor-pointer"
                        >
                          <input
                            type="radio"
                            value={opt}
                            {...register("label")}
                            className="accent-blue-600"
                          />
                          <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    <FieldError message={errors.label?.message} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      {...register("addressLine")}
                      placeholder="Building, street, area..."
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                        ${errors.addressLine ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                    />
                    <FieldError message={errors.addressLine?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        {...register("city")}
                        placeholder="City"
                        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                          ${errors.city ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                      />
                      <FieldError message={errors.city?.message} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        {...register("state")}
                        placeholder="State"
                        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                          ${errors.state ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                      />
                      <FieldError message={errors.state?.message} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        {...register("pincode")}
                        placeholder="e.g. 695001"
                        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                          ${errors.pincode ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                      />
                      <FieldError message={errors.pincode?.message} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone{" "}
                        <span className="text-gray-400 font-normal">
                          (for this address)
                        </span>
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        placeholder="+91 98765 43210"
                        className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                          ${errors.phone ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                      />
                      <FieldError message={errors.phone?.message} />
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Pin location on map
                          <span className="ml-1 text-gray-400 font-normal text-xs">
                            (optional)
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Helps the delivery agent find you accurately
                        </p>
                      </div>
                      {geoStatus !== "done" && (
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={geoStatus === "fetching"}
                          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        >
                          {geoStatus === "fetching" ? (
                            <>
                              <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                              Detecting…
                            </>
                          ) : (
                            <>📍 Use my location</>
                          )}
                        </button>
                      )}
                    </div>

                    {geoStatus === "done" && coords && (
                      <div className="flex items-center justify-between mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs text-green-700">
                          <span>✓</span>
                          <span className="font-medium">Location captured</span>
                          <span className="text-green-500 font-mono">
                            {coords.latitude.toFixed(5)},{" "}
                            {coords.longitude.toFixed(5)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCoords(null);
                            setGeoStatus("idle");
                          }}
                          className="text-xs text-gray-400 hover:text-red-500 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {geoError && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        ⚠ {geoError}
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register("isDefault")}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Set as default address
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : initial
                      ? "Update Address"
                      : "Add Address"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
