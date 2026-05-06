"use client";

import { addToCart } from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const getImageSrc=(path)=>{
  if(!path) return null
  if(path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`
}

export default function MenuItemCard({ item, onSelect }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  // const inCart = cartItems.find((i) => i.menuItemId === item.id);

  const handleAdd = (e) => {
    e.stopPropagation();
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
    <div
      className="bg-white rounded-lg shadow-sm flex flex-col h-full border border-gray-100 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key=== " ") onSelect(item);
      }}
      aria-label={`View details for ${item.name}`}
    >
      <div className="w-full h-45 bg-gray-100 shrink-0">
        <img
          src={getImageSrc(item.imageUrl || item.images?.[0]?.imageUrl)}
          alt={item.name}
          className="object-cover w-full h-full rounded-t-lg"
        />
      </div>
      <div className="p-4 flex-col flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-blue-600 font-bold text-lg">
            ${parseFloat(item.price).toFixed(2)}
          </p>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
