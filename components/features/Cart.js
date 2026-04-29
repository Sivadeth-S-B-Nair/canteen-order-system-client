"use client";

import api from "@/lib/axios";
import { clearCart, removeFromCart, updateQty } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQtyChange = (menuItemId, newQty) => {
    if (newQty < 1) {
      dispatch(removeFromCart(menuItemId));
    } else {
      dispatch(
        updateQty({
          menuItemId,
          qty: newQty,
        }),
      );
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.qty,
    0,
  );

  const handlePlaceOrder=async()=>{
    if(cartItems.length===0) return
    setLoading(true)
    setError(null)

    try{
      const items=cartItems.map(item=>({
        menuItemId:item.menuItemId,
        qty:item.qty
      }))
      
      const res=await api.post("/api/orders",{items})
      console.log(res.data);
      
      dispatch(clearCart())

      // router.push("/user/orders")
    }
    catch(err){
      setError(err.response?.data?.message || "Failed to place order")
    }
    finally{
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-400 text-sm">Your cart is empty</p>
        <p className="text-gray-400 text-xs mt-1">Add items from the menu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="font-bold text-lg mb-4">Your Cart</h2>
      <div className="space-y-3">
        {cartItems.map((item) => {
          return (
            <div
              key={item.menuItemId}
              className="flex justify-center items-center"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">
                  ${parseFloat(item.price).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQtyChange(item.menuItemId, item.qty - 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                >
                  -
                </button>
                <span className="text-sm w-4 text-center">{item.qty}</span>
                <button
                  onClick={() => handleQtyChange(item.menuItemId, item.qty + 1)}
                  className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                >
                  +
                </button>
              </div>
              <p className="text-sm font-medium ml-3 w-16 text-right">
                ${(parseFloat(item.price) * item.qty).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t mt-4 pt-3">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}

      <button disabled={loading} onClick={handlePlaceOrder} className="w-full mt-4 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">
        {loading?"Placing order...":`Place Order . $${total.toFixed(2)}`}
      </button>
    </div>
  );
}
