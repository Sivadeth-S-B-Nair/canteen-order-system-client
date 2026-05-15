"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog, DialogBackdrop, DialogPanel, DialogTitle,
} from "@headlessui/react";
import { menuItemSchema, menuItemDefault } from "@/lib/validations"

// ─────────────────────────────────────────────────────────────────────────────
// This component was extracted because the menu form is 100% identical
// between kitchen/menu/page.js and restaurant-admin/menu/page.js.
// Previously you had the same ~200 lines duplicated in both files.
//
// Props:
//   open      → boolean, controls dialog visibility
//   onClose   → called when user cancels or closes
//   onSubmit  → async (formData: FormData) => void — parent handles the API call
//               We pass FormData up because the parent has the dispatch + items state
// ─────────────────────────────────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-red-500 text-xs mt-1">{message}</p>
}

function ImageTile({ img, isPrimary, onRemove }) {
  return (
    <div className={`relative group rounded-lg overflow-hidden border-2 transition-colors w-full h-full min-h-24
        ${isPrimary ? "border-blue-500" : "border-transparent hover:border-blue-300"}`}>
      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
      {isPrimary && (
        <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          Primary
        </span>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onRemove(img.id)}
          className="bg-white text-red-600 text-xs px-2 py-1 rounded font-medium hover:bg-red-600 hover:text-white transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function AddMenuItemDialog({ open, onClose, onSubmit: onParentSubmit }) {
  const fileInputRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageError, setImageError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: menuItemDefault,
    mode: "onTouched",
  })

  // ── Price field: only allow digits and one decimal point ──────────────────
  // This is stricter character rejection:
  //   - Digits 0-9: always allowed
  //   - A single ".": allowed only if no "." already in the input
  //   - Everything else: blocked immediately
  //
  // Compare this to the name field where we used onKeyDown.
  // Both work — onKeyDown is slightly better because it catches
  // keys before they appear, while onChange catches them after.
  // For price, onKeyDown is cleaner.
  const rejectNonNumericOnPrice = (e) => {
    const controlKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"]
    const isCtrlCmd = e.ctrlKey || e.metaKey

    if (controlKeys.includes(e.key) || isCtrlCmd) return // always allow

    const isDigit = /^[0-9]$/.test(e.key)
    const isDot = e.key === "."
    const alreadyHasDot = e.currentTarget.value.includes(".")

    if (!isDigit && !isDot) {
      e.preventDefault() // reject letters, symbols, etc.
      return
    }
    if (isDot && alreadyHasDot) {
      e.preventDefault() // reject a second decimal point
      return
    }
  }

  // ── Image handling ────────────────────────────────────────────────────────
  // This stays as manual state (not registered with RHF) because:
  //   1. File inputs are tricky to register with RHF
  //   2. We need custom validation (at least 1 image)
  //   3. We build a FormData object on submit anyway
  const processFiles = (rawFiles) => {
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    const MAX_SIZE = 5 * 1024 * 1024
    const errors = []
    const valid = []

    Array.from(rawFiles).forEach((file) => {
      if (!ALLOWED.includes(file.type)) {
        errors.push(`${file.name} must be JPEG, JPG, PNG or WebP`)
      } else if (file.size > MAX_SIZE) {
        errors.push(`${file.name} exceeds 5 MB`)
      } else {
        valid.push({ file, preview: URL.createObjectURL(file), id: `${Date.now()}-${Math.random()}` })
      }
    })

    if (errors.length) setImageError(errors.join("; "))
    else setImageError(null)
    if (valid.length) setImageFiles((prev) => [...prev, ...valid])
  }

  const removeImage = (id) => {
    setImageFiles((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleClose = () => {
    imageFiles.forEach((img) => URL.revokeObjectURL(img.preview))
    setImageFiles([])
    setImageError(null)
    reset() // RHF reset: clears field values AND errors
    onClose()
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  // handleSubmit(onFormValid) is called by RHF only if zod validation passes.
  // We still manually check images here because they're outside RHF's control.
  const onFormValid = async (data) => {
    if (imageFiles.length === 0) {
      setImageError("Please add at least one image")
      return
    }

    // Build FormData for multipart upload
    // data comes from RHF — already validated and typed by zod
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== "") formData.append(k, v)
    })
    imageFiles.forEach(({ file }) => formData.append("images", file))

    await onParentSubmit(formData) // parent handles API + dispatch + close
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <form onSubmit={handleSubmit(onFormValid)} noValidate>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Add New Menu Item
                </DialogTitle>

                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                        ${errors.name ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                    />
                    <FieldError message={errors.name?.message} />
                  </div>

                  {/* Price — with character rejection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="text" // NOT type="number" — number inputs have browser quirks
                      inputMode="decimal" // shows numeric keyboard on mobile
                      {...register("price")}
                      onKeyDown={rejectNonNumericOnPrice}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                        ${errors.price ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                      placeholder="0.00"
                    />
                    {/* 
                      Why type="text" not type="number"?
                      type="number" has inconsistent behaviour:
                        - Allows "e" (scientific notation like 1e5)
                        - Allows "-" (negatives)
                        - Behaves differently in Chrome vs Firefox
                        - Doesn't let you control decimal precision
                      type="text" + inputMode="decimal" gives mobile numeric keyboard
                      while letting us control exactly what's accepted.
                    */}
                    <FieldError message={errors.price?.message} />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      {...register("category")}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                        ${errors.category ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                      placeholder="e.g. Mains, Sides, Drinks"
                    />
                    <FieldError message={errors.category?.message} />
                  </div>

                  {/* Description — full width, optional */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <textarea
                      {...register("description")}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2
                        ${errors.description ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-500"}`}
                      rows={2}
                    />
                    <FieldError message={errors.description?.message} />
                  </div>

                  {/* Images — managed outside RHF */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images
                      <span className="text-gray-400 font-normal ml-1">(first is primary)</span>
                    </label>
                    {imageFiles.length > 0 && (
                      <div className="mb-3">
                        {imageFiles.length === 1 ? (
                          <ImageTile img={imageFiles[0]} isPrimary onRemove={removeImage} />
                        ) : (
                          <div className="flex gap-2">
                            <div className="w-2/5 shrink-0">
                              <ImageTile img={imageFiles[0]} isPrimary onRemove={removeImage} />
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-2 content-start max-h-52 overflow-y-auto">
                              {imageFiles.slice(1).map((img) => (
                                <ImageTile key={img.id} img={img} onRemove={removeImage} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className="border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <p className="text-sm text-gray-500">
                      {imageFiles.length === 0 ? "Click to browse" : `Add more (${imageFiles.length} selected)`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPEG · PNG · WebP · max 5 MB each</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => { processFiles(e.target.files); e.target.value = "" }}
                    className="hidden"
                  />

                  {imageError && (
                    <p className="text-red-500 col-span-2 text-sm">{imageError}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Item"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}