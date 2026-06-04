'use client';

// app/agent/orders/page.js
// History of all deliveries assigned to this agent

import api from '@/lib/axios';
import { useEffect, useState } from 'react';
import OrderItemsList from '@/components/ui/OrderItemsList';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/orders/my-deliveries');
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Deliveries</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length} delivery{orders.length !== 1 ? 'ies' : ''} assigned to you
        </p>
      </div>

      {loading && <p className="text-center text-gray-500">Loading…</p>}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400">No deliveries yet</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">Order #{order.id}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <OrderItemsList orderItems={order.orderItems} />

            {order.deliveryAddress && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-700 mb-0.5">Delivered to</p>
                <p className="text-gray-600">{order.deliveryAddress.addressLine}</p>
              </div>
            )}

            <div className="flex justify-between border-t mt-3 pt-3 font-semibold text-sm text-gray-800">
              <span>Total</span>
              <span>₹{parseFloat(order.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}