"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  MessageSquare,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Support Tickets",
    href: "/admin/tickets",
    icon: MessageSquare,
  },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`bg-white h-[calc(100vh-64px)] shadow-sm relative ${
            collapsed ? "w-16" : "w-64"
          } transition-width duration-300 ease-in-out`}
        >
          {/* Toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 bg-white rounded-full p-1.5 border shadow-sm"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Sidebar items */}
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-blue-600" : ""}`}
                  />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
