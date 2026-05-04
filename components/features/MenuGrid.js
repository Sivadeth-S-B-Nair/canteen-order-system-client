"use client";

import MenuItemCard from "./MenuItemCard";

export default function MenuGrid({ items }) {
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  //grouped={ "Mains": [Burger, Pizza], "Sides": [Fries] }

  const categories = Object.keys(grouped);

  if (categories.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">No items available</p>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        return (
          <div key={category}>
            <h2 className="text-lg font-bold text-gray-700 mb-3 pb-2 border-b">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {grouped[category].map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
