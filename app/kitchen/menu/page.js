"use client";

import api from "@/lib/axios";
import { setMenuItems } from "@/store/slices/menuSlice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function KitchenMenuPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.menu);
  const { accessToken } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef(null);

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get("/api/menu");
        dispatch(setMenuItems(res.data.data));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMenu();
  }, [accessToken, dispatch]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const processFiles = (rawFiles) => {
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_SIZE = 5 * 1024 * 1024;
    const errors = [];
    const valid = [];
    Array.from(rawFiles).forEach((file) => {
      if (!ALLOWED.includes(file.type)) {
        errors.push(`${file.name} must be JPEG, JPG, PNG or WebP`);
      } else if (file.size > MAX_SIZE) {
        errors.push(`${file.name} exceeds 5 MB`);
      } else {
        valid.push({
          file,
          preview: URL.createObjectURL(file),
          id: `${Date.now()}-${Math.random()}`,
        });
      }
    });
    if (errors.length) setError(errors.join("; "));
    else setError(null);

    if (valid.length) setImageFiles((prev) => [...prev, ...valid]);
  };

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImageFiles((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleClose = () => {
    imageFiles.forEach((img) => URL.revokeObjectURL(img.preview));
    setImageFiles([]);
    setShowForm(false);
    setError(null);
    setForm({ name: "", description: "", price: "", category: "" });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setError("Add atleast one image");
      return;
    }
    setAdding(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      imageFiles.forEach(({ file }) => formData.append("images", file));

      const res = await api.post("/api/menu", formData);
      dispatch(setMenuItems([...items, res.data.data]));
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
      });
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/api/menu/${id}/toggle`);
      dispatch(
        setMenuItems(
          items.map((item) => (item.id === id ? res.data.data : item)),
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Add and manage menu items
          </p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          Add Item
        </button>
      </div>

      <Dialog open={showForm} onClose={handleClose} className="relative z-10">
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
              <form onSubmit={handleAddItem}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2"
                  >
                    Add New Menu Item
                  </DialogTitle>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "name", label: "Name", type: "text" },
                      { name: "price", label: "Price", type: "number" },
                      { name: "category", label: "Category", type: "text" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    ))}

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images
                        <span className="text-gray-400 font-normal ml-1">
                          (first is primary)
                        </span>
                      </label>
                      {imageFiles.length > 0 && (
                        <div className="mb-3">
                          {imageFiles.length === 1 ? (
                            <ImageTile
                              img={imageFiles[0]}
                              isPrimary
                              onRemove={removeImage}
                            />
                          ) : (
                            <div className="flex gap-2">
                              <div className="w-2/5 flex-shrink-0">
                                <ImageTile
                                  img={imageFiles[0]}
                                  isPrimary
                                  onRemove={removeImage}
                                />
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-2 content-start max-h-52 overflow-y-auto">
                                {imageFiles.slice(1).map((img) => (
                                  <ImageTile
                                    key={img.id}
                                    img={img}
                                    onRemove={removeImage}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      className="border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
                      // onDragOver={handleDragOver}
                      // onDragLeave={handleDragLeave}
                      // onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <p className="text-sm text-gray-500">
                        {imageFiles.length === 0
                          ? "Click to browse"
                          : `Add more (${imageFiles.length} selected)`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPEG · PNG · WebP · max 5 MB each
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    {error && (
                      <p className="text-red-500 col-span-2 text-sm">{error}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={adding}
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    {adding ? "Saving..." : "Save Item"}
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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap min-w-150">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Name",
                  "Category",
                  "Price",
                  "Images",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-gray-600 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3 text-gray-500">{i.category}</td>
                  <td className="px-4 py-3">
                    ${parseFloat(i.price).toFixed(2)}
                  </td>
                  {/* [CHANGE 6]: Show image count in the table */}
                  <td className="px-4 py-3 text-gray-500">
                    {i.images?.length ?? 0} image
                    {i.images?.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        i.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {i.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(i.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ImageTile({ img, isPrimary, onRemove}) {
  return (
    <div
      className={`relative group rounded-lg overflow-hidden border-2 transition-colors w-full h-full min-h-24 ${
        isPrimary
          ? "border-blue-500"
          : "border-transparent hover:border-blue-300"
      }`}
    >
      <img
        src={img.preview}
        alt="preview"
        className="w-full h-full object-cover"
      />

      {isPrimary && (
        <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          Primary
        </span>
      )}

      {/* Overlay with actions — visible on hover */}
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
