"use client";

import api from "@/lib/axios";
import { setMenuItems } from "@/store/slices/menuSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddMenuItemDialog from "@/components/features/AddMenuItemDialog";

export default function RestaurantAdminMenuPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.menu);
  const { accessToken } = useSelector((state) => state.auth);
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

  const handleAddItem = async (formData) => {
    const res = await api.post("/api/menu", formData);
    dispatch(setMenuItems([...items, res.data.data]));
    setShowForm(false)
  }

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/api/menu/${id}/toggle`);
      dispatch(setMenuItems(items.map((item) => (item.id === id ? res.data.data : item))));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add and manage menu items</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          onClick={() => setShowForm(true)}
        >
          Add Item
        </button>
      </div>

      <AddMenuItemDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddItem}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap min-w-150">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Name", "Category", "Price", "Images", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3 text-gray-500">{i.category}</td>
                  <td className="px-4 py-3">${parseFloat(i.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {i.images?.length ?? 0} image{i.images?.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${i.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {i.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(i.id)} className="text-blue-600 hover:underline text-sm">
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