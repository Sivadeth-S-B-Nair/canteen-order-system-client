"use client";

import api from "@/lib/axios";
import { setMenuItems } from "@/store/slices/menuSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export default function KitchenMenuPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.menu);
  const { accessToken } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
  });
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
  const handleAddItem = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      const res = await api.post("/api/menu", form);
      dispatch(setMenuItems([...items, res.data.data]));
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
      });
      setShowForm(false);
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
      <Dialog open={showForm} onClose={setShowForm} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* [CHANGE 5]: Changed modal background from bg-gray-800 (dark mode) to bg-white */}
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-xl data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              {/* [CHANGE 6]: Wrapped the entire content in the <form> tag so the "Enter" key still submits */}
              <form onSubmit={handleAddItem}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Add New Menu Item
                  </DialogTitle>
                  
                  {/* Your original form grid goes here */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "name", label: "Name", type: "text" },
                      { name: "price", label: "Price", type: "number" },
                      { name: "category", label: "Category", type: "text" },
                      { name: "imageUrl", label: "Image URL", type: "text" },
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
                    {error && <p className="text-red-500 col-span-2 text-sm">{error}</p>}
                  </div>
                </div>

                {/* [CHANGE 7]: Integrated standard modal footer styling for the buttons */}
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
                    onClick={() => setShowForm(false)}
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
        {/* Added overflow-x-auto wrapper for mobile scrolling */}
        <div className="overflow-x-auto">
          {/* Added whitespace-nowrap to prevent text from crushing together */}
          <table className="w-full text-sm whitespace-nowrap min-w-150">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Name", "Category", "Price", "Status", "Action"].map((h) => (
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
                {items.map(i=>(
                  <tr key={i.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="px-4 py-3 text-gray-500">{i.category}</td>
                      <td className="px-4 py-3">${parseFloat(i.price).toFixed(2)}</td>
                      <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${i.isAvailable?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
                            {i.isAvailable?"Available":"Unavailable"}
                          </span>
                      </td>
                      <td className="px-4 py-3">
                          <button onClick={()=>{handleToggle(i.id)}} className="text-blue-600 hover:underline text-sm">Toggle</button>
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