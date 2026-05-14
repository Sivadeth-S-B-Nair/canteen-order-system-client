"use client";

import KitchenOrderCard from "@/components/features/KitchenOrderCard";
import api from "@/lib/axios";
import { setAllOrders, setOrdersLoading } from "@/store/slices/orderSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function RestaurantAdminOrdersPage() {
  const dispatch = useDispatch();
  const { allOrders, loading } = useSelector((state) => state.orders);
  const { accessToken } = useSelector((state) => state.auth);
  useEffect(() => {
    // if(!accessToken) return
    const fetchOrders = async () => {
      dispatch(setOrdersLoading());
      try {
        const res = await api.get("/api/orders/all");
        dispatch(setAllOrders(res.data.data));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    fetchOrders();
  }, [accessToken, dispatch]);
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          {allOrders.length} active order{allOrders.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading && (
          <p className="text-center text-gray-500">Loading orders...</p>
        )}
        {!loading && allOrders.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-lg">No active order</p>
            <p className="text-gray-400 text-sm mt-1">
              New orders will appear here
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allOrders.map((order) => {
            return <KitchenOrderCard key={order.id} order={order} />;
          })}
        </div>
      </div>
    </div>
  );
}
