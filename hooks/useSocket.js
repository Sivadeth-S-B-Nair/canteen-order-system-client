"use client";

import { connectSocket } from "@/lib/socket";
import { updateOrderInList, addNewOrder } from "@/store/slices/orderSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const STAFF_ROLES = ["kitchen_staff", "restaurant_admin"];

export default function useSocket() {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!accessToken || !user) return;
    const socket = connectSocket(accessToken);

    if (STAFF_ROLES.includes(user.role)) {
      socket.on("new-order", (order) => {
        console.log("New confirmed order recieved:", order.id);
        dispatch(addNewOrder(order));
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-gray-800">
                New Order #{order.id}
              </p>
              <p className="text-sm text-gray-500">
                {order.orderItems?.length} item . ₹
                {parseFloat(order.totalPrice).toFixed(2)}
              </p>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-xs text-blue-600 hover:underline text-left mt-1"
              >
                Dismiss
              </button>
            </div>
          ),
          {
            duration: 6000,
            style: {
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
            },
          },
        );
      });
      socket.on("order-updated", (order) => {
        console.log("Order updated:", order.id, order.status);
        dispatch(updateOrderInList(order));
      });
    }

    if (user.role === "delivery_agent") {
      // new-delivery: fired when the admin assigns this agent to an order
      socket.on("new-delivery", (order) => {
        console.log("New delivery assigned:", order.id);
        dispatch(addNewOrder(order));
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-gray-800">
                New Delivery: Order #{order.id}
              </p>
              <p className="text-sm text-gray-500">
                {order.orderItems?.length} item · ₹
                {parseFloat(order.totalPrice).toFixed(2)}
              </p>
              {order.estimatedDeliveryTime && (
                <p className="text-xs text-gray-400">
                  ETA:{" "}
                  {new Date(order.estimatedDeliveryTime).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              )}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-xs text-emerald-600 hover:underline text-left mt-1"
              >
                Dismiss
              </button>
            </div>
          ),
          {
            duration: 8000,
            style: {
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#14532d",
            },
          },
        );
      });
      socket.on("order-updated", (order) => {
        dispatch(updateOrderInList(order));
      });
    }

    if (user.role === "user") {
      socket.on("order-updated", (order) => {
        console.log("Your order updated:", order.id, order.status);
        dispatch(updateOrderInList(order));
        const messages = {
          CONFIRMED: {
            message: `Order #${order.id} confirmed - kitchen is on it!`,
            style: {
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
            },
          },
          Cooking: {
            message: `Order #${order.id} is being prepared`,
            type: "default",
            style: {
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
            },
          },
          Ready: {
            message: `Order #${order.id} is ready! Please collect it`,
            type: "success",
            style: {
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
            },
          },
          "Out for Delivery": {
            message: `Order #${order.id} is out for delivery! 🛵`,
            style: {
              background: "#ecfdf5",
              border: "1px solid #6ee7b7",
              color: "#065f46",
            },
          },
          Delivered: {
            message: `Order #${order.id} has been delivered. Enjoy!`,
            style: {
              background: "#f0fdf4",
              border: "1px solid #86efac",
              color: "#166534",
            },
          },
          "Picked Up": {
            message: `Order #${order.id} picked up. Enjoy!`,
            type: "default",
            style: {
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              color: "#374151",
            },
          },
        };
        const config = messages[order.status];
        if (config) {
          toast(config.message, {
            duration:
              order.status === "Ready" || order.status === "Delivered"
                ? 8000
                : 4000,
            style: config.style,
          });
        }
      });
    }

    return () => {
      socket.off("new-order");
      socket.off("new-delivery");
      socket.off("order-updated");
    };
  }, [accessToken, user, dispatch]);
}

export function useOrderTracking(orderId, onLocationUpdate, onOrderUpdated,onAgentNearby) {
  const { accessToken, user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (!accessToken || !user || !orderId) return;
    const socket = connectSocket(accessToken);
    socket.emit("join-order-room", { orderId });

    const handleLocationUpdate = (data) => {
      if (data.orderId === orderId) {
        onLocationUpdate(data);
      }
    };

    const handleOrderUpdated = (data) => {
      if (data.id === orderId && onOrderUpdated) {
        onOrderUpdated(data);
      }
    };

    const handleAgentNearby=(data)=>{
      if(data.orderId===orderId&&onAgentNearby){
        onAgentNearby(data)
      }
    }

    socket.on("location-update", handleLocationUpdate);
    socket.on("order-updated", handleOrderUpdated);
    socket.on("agent-nearby",handleAgentNearby)

    return () => {
      socket.off("location-update", handleLocationUpdate);
      socket.off("order-updated", handleOrderUpdated);
      socket.off("agent-nearby", handleAgentNearby);
    };
  }, [accessToken, user, orderId, onLocationUpdate,onOrderUpdated,onAgentNearby]);
}
