"use client";

import MenuGrid from "@/components/features/MenuGrid";
import Cart from "@/components/features/Cart";
import api from "@/lib/axios";
import { setMenuError, setMenuItems, setMenuLoading } from "@/store/slices/menuSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function RestaurantsPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.menu);

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get("/api/restaurants");
        setRestaurants(res.data.data);
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      } finally {
        setRestaurantsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchMenu = async () => {
      dispatch(setMenuLoading());
      try {
        // Pass restaurantId as query param — backend scopes query to this restaurant
        const res = await api.get(`/api/menu?restaurantId=${selectedRestaurant.id}`);
        dispatch(setMenuItems(res.data.data));
      } catch (err) {
        dispatch(setMenuError(err.response?.data?.message || "Failed to load menu"));
      }
    };

    fetchMenu();
  }, [selectedRestaurant, dispatch]);

  if (!selectedRestaurant) {
    return (
      <div>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Choose a Restaurant</h1>
          <p className="text-gray-500 text-sm mt-1">
            Select a canteen to browse its menu
          </p>
        </div>

        {restaurantsLoading && (
          <p className="text-center text-gray-500">Loading restaurants...</p>
        )}

        {!restaurantsLoading && restaurants.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No restaurants available right now.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {restaurants.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRestaurant(r)}
              className="bg-white rounded-xl border border-gray-200 p-6 text-left
                hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100">
                <span className="text-xl">🍽️</span>
              </div>
              <p className="font-semibold text-gray-800">{r.name}</p>
              {r.location && (
                <p className="text-sm text-gray-500 mt-1">{r.location}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Menu + Cart screen ─────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => {
            setSelectedRestaurant(null);
            dispatch(setMenuItems([])); // clear previous restaurant's menu
          }}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3"
        >
          ← Back to restaurants
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">{selectedRestaurant.name}</h1>
          {selectedRestaurant.location && (
            <p className="text-gray-500 text-sm mt-1">{selectedRestaurant.location}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {loading && (
            <p className="text-center text-gray-500 mt-10">Loading menu...</p>
          )}
          {error && (
            <p className="text-center text-red-500 mt-10">{error}</p>
          )}
          {!loading && !error && <MenuGrid items={items} />}
        </div>

        <div className="w-full md:w-80 mt-8 md:sticky md:top-20 h-fit">
          <Cart />
        </div>
      </div>
    </div>
  );
}