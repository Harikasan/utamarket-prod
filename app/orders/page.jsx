"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  Package,
  Search,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusColors = {
  delivered: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  delivered: CheckCircle2,
  processing: Clock,
  shipped: Truck,
  cancelled: XCircle,
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id
      .toString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#0064B1]" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-zinc-600">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-zinc-600">
                Track and manage your UTA merchandise orders
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Input
                type="search"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No orders found</h2>
              <p className="text-zinc-600">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter settings"
                  : "You haven't placed any orders yet"}
              </p>
              <Button asChild className="mt-6">
                <Link href="/listings">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const StatusIcon =
                  statusIcons[order.status.toLowerCase()] || AlertCircle;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Order Header */}
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-[#0064B1]/10 p-3 rounded-full">
                            <Package className="h-6 w-6 text-[#0064B1]" />
                          </div>
                          <div>
                            <p className="font-medium">
                              #{order.id.toString().padStart(6, "0")}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge
                            className={
                              statusColors[order.status.toLowerCase()] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {order.status}
                          </Badge>
                          <p className="font-medium">
                            ${order.total_amount.toFixed(2)}
                          </p>
                          {expandedOrder === order.id ? (
                            <ChevronUp className="h-5 w-5 text-zinc-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    {expandedOrder === order.id && (
                      <div className="border-t">
                        <div className="p-6">
                          <h3 className="font-medium mb-4">Order Items</h3>
                          <div className="space-y-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex gap-4">
                                <div className="relative h-24 w-24 rounded-md overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-zinc-600">
                                    {item.selectedSize &&
                                      `Size: ${item.selectedSize}`}
                                    {item.selectedColor &&
                                      ` • Color: ${item.selectedColor}`}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <p>${item.price.toFixed(2)}</p>
                                    <p className="text-zinc-600">
                                      Quantity: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-6 pt-6 border-t">
                            <h3 className="font-medium mb-4">Order Summary</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Shipping</span>
                                <span>
                                  {order.shipping_fee > 0
                                    ? `$${order.shipping_fee.toFixed(2)}`
                                    : "FREE"}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-600">Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Total</span>
                                <span>${order.total_amount.toFixed(2)}</span>
                              </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                              <h3 className="font-medium mb-2">
                                Shipping Address
                              </h3>
                              <p className="text-sm text-zinc-600">
                                {order.shipping_address}
                                <br />
                                {order.shipping_city}, {order.shipping_state}{" "}
                                {order.shipping_zip}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
