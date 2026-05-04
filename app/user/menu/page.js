"use client";

import MenuGrid from "@/components/features/MenuGrid";
import Cart from "@/components/features/Cart";
import api from "@/lib/axios";
import {
  setMenuError,
  setMenuItems,
  setMenuLoading,
} from "@/store/slices/menuSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function MenuPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.menu);

  useEffect(() => {
    const fetchMenu = async () => {
      dispatch(setMenuLoading());
      try {
        const res = await api.get("/api/menu");
        dispatch(setMenuItems(res.data.data));
        console.log(res.data.data);
      } catch (err) {
        dispatch(
          setMenuError(err.response?.data?.message || "Failed to load menu"),
        );
      }
    };
    fetchMenu();
  }, []);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and order your food</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {loading && (
            <p className="text-center text-gray-500 mt-10">Loading menu...</p>
          )}
          {error && <p className="text-center text-red-500 mt-10">{error}</p>}
          {!loading && !error && <MenuGrid items={items} />}
        </div>

        {/* Right — Cart (always visible) */}
        <div className="w-full md:w-80 mt-8 md:sticky md:top-20 h-fit">
          <Cart />
        </div>
      </div>
    </div>
  );
}
