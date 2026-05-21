"use client";

import OrderItemsList from "@/components/ui/OrderItemsList";
import StatusBadge from "@/components/ui/StatusBadge";
import api from "@/lib/axios";
import { useEffect, useState } from "react";

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700",
  restaurant_admin: "bg-blue-100 text-blue-700",
  kitchen_staff: "bg-orange-100 text-orange-700",
  user: "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Only fire the API when the user stops typing
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/admin/users", {
          params: { search: debouncedSearch, page, limit: 20 },
        });
        setUsers(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [debouncedSearch, page]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setOrdersLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${user.id}/orders`);
      setUserOrders(res.data.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (selectedUser) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => {
            setSelectedUser(null);
            setUserOrders([]);
          }}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4"
        >
          ← Back to users
        </button>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            {selectedUser.name}
          </h1>
          <p className="text-gray-500 text-sm">{selectedUser.email}</p>
          <span
            className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[selectedUser.role]}`}
          >
            {selectedUser.role.replace("_", " ")}
          </span>
        </div>
        <h2 className="font-semibold text-gray-700 mb-3">Order history</h2>
        {ordersLoading && (
          <p className="text-gray-500 text-sm">Loading orders...</p>
        )}
        {!ordersLoading && userOrders.length === 0 && (
          <p className="text-gray-400 text-sm">No orders yet.</p>
        )}

        <div className="space-y-4">
          {userOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <OrderItemsList orderItems={order.orderItems} />
              <div className="flex justify-between border-t mt-3 pt-3 font-semibold text-sm text-gray-800">
                <span>Total</span>
                <span>${parseFloat(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          {total} registered user{total !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">
            {search ? `No users matching "${search}"` : "No users yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Name", "Email", "Role", "Restaurant", "Joined", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-gray-600 font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {user.name}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{user.email}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}
                    >
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {user.restaurant?.name || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      View orders →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Page {page} of {totalPages} — {total} results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
