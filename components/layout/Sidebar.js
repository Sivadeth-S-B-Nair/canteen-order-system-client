"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

const HomeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const OrdersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const StoreIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);
const ChartIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const NAV_LINKS = {
  super_admin: [
    { label: "Dashboard", href: "/super-admin/dashboard", icon: <HomeIcon /> },
    { label: "Analytics", href: "/super-admin/analytics", icon: <ChartIcon /> },
    {
      label: "Restaurants",
      href: "/super-admin/restaurants",
      icon: <StoreIcon />,
    },
    { label: "Users", href: "/super-admin/users", icon: <UsersIcon /> },
  ],
  restaurant_admin: [
    {
      label: "Dashboard",
      href: "/restaurant-admin/dashboard",
      icon: <HomeIcon />,
    },
    { label: "Orders", href: "/restaurant-admin/orders", icon: <OrdersIcon /> },
    { label: "Menu", href: "/restaurant-admin/menu", icon: <MenuIcon /> },
    { label: "Staff", href: "/restaurant-admin/staff", icon: <UsersIcon /> },
  ],
  kitchen_staff: [
    { label: "Orders", href: "/kitchen/orders", icon: <OrdersIcon /> },
  ],
  user: [
    { label: "Restaurants", href: "/user/restaurants", icon: <StoreIcon /> },
    { label: "My Orders", href: "/user/orders", icon: <OrdersIcon /> },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const links = NAV_LINKS[user?.role] || [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-30 z-30 md:hidden"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-40 w-64 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {user?.role && (
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {user.role.replace("_", " ")}
            </span>
          </div>
        )}
        <nav className="p-2 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
