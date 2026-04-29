"use client";

import OrderCard from "@/components/features/OrderCard";
import api from "@/lib/axios";
import { setMyOrders, setOrdersLoading } from "@/store/slices/orderSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { myOrders, loading } = useSelector((state) => state.orders);
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    // if (!accessToken) return
    const fetchOrders = async () => {
      dispatch(setOrdersLoading());
      try {
        const res = await api.get("/api/orders/user");
        dispatch(setMyOrders(res.data.data));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    fetchOrders();
  }, [accessToken, dispatch]);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Track your order status</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading && (
          <p className="text-center text-gray-500">Loading orders...</p>
        )}

        {!loading && myOrders.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400">No orders yet</p>
            <a
              href="/user/menu"
              className="text-blue-600 text-sm mt-2 inline-block"
            >
              Order something
            </a>
          </div>
        )}
        {myOrders.map((order) => {
          return <OrderCard key={order.id} order={order} />;
        })}
      </div>
    </div>
  );
}
