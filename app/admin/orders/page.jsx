"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  Filter,
  Search,
  MoreVertical,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [ORDER_STATUS.PROCESSING]: "bg-blue-100 text-blue-800",
  [ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

// Helper function to safely format numbers
const formatNumber = (value, decimals = 2) => {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(decimals);
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
  });
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data.recentOrders || []);
      setStats({
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        averageOrderValue: data.averageOrderValue || 0,
        pendingOrders: data.pendingOrders || 0,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Refresh orders after successful update
      await fetchOrders();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      // You might want to show an error toast here
    }
  };

  const openConfirmDialog = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setIsConfirmDialogOpen(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const exportToCSV = () => {
    // Create CSV header
    const headers = [
      "Order ID",
      "Customer",
      "Date",
      "Status",
      "Amount",
      "Items",
      "Shipping Address",
    ];

    // Convert orders to CSV rows
    const rows = filteredOrders.map((order) => [
      order.id,
      order.customer_name,
      new Date(order.created_at).toLocaleDateString(),
      STATUS_LABELS[order.status],
      formatCurrency(order.total_amount),
      order.items
        ?.map((item) => `${item.name} (${item.quantity})`)
        .join(", ") || "",
      order.shipping_address || "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <Button className="flex items-center gap-2" onClick={exportToCSV}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </h3>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(stats.averageOrderValue)}
              </h3>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </TableCell>
                  <TableCell>${formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        View Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {Object.entries(STATUS_LABELS)
                            .filter(([key]) => key !== order.status)
                            .map(([key, label]) => (
                              <DropdownMenuItem
                                key={key}
                                onClick={() => openConfirmDialog(order, key)}
                              >
                                Change status to {label}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Status Change Confirmation Dialog */}
      {isConfirmDialogOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Status Change
            </h3>
            <p>
              Are you sure you want to change the status of order #
              {selectedOrder.id} to{" "}
              <span className="font-semibold">{STATUS_LABELS[newStatus]}</span>?
            </p>
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleStatusChange(selectedOrder.id, newStatus)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about the order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-500">Order ID</h4>
                  <p>#{selectedOrder.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Date</h4>
                  <p>
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Status</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[selectedOrder.status]
                    }`}
                  >
                    {STATUS_LABELS[selectedOrder.status]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-500">Total Amount</h4>
                  <p>{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-500">Name</h4>
                    <p>{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Email</h4>
                    <p>{selectedOrder.customer_email}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="font-medium text-gray-500">
                      Shipping Address
                    </h4>
                    <p>{selectedOrder.shipping_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Order Notes</h3>
                  <p className="text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
