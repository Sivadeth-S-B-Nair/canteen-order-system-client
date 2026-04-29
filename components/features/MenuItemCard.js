"use client";

import { addToCart } from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

export default function MenuItemCard({ item }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  // const inCart = cartItems.find((i) => i.menuItemId === item.id);

  const handleAdd = () => {
    dispatch(
      addToCart({
        menuItemId: item.id,
        name: item.name,
        price: parseFloat(item.price),
      }),
    );
    // console.log(cartItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        <p className="text-blue-600 font-semibold mt-2">
          ${parseFloat(item.price).toFixed(2)}
        </p>
      </div>

      <button
        onClick={handleAdd}
        className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        Add
      </button>
    </div>
  );
}
