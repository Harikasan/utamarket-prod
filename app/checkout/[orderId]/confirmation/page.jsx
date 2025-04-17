"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${params.orderId}`);
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch order");
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.orderId) {
      fetchOrder();
    }
  }, [params.orderId, router]);

  const formatPrice = (value) => {
    if (typeof value === "string") {
      value = parseFloat(value);
    }
    return typeof value === "number" ? value.toFixed(2) : "0.00";
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0064B1]"></div>
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
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-zinc-600 mb-8">
                Thank you for your purchase. Your order has been received and
                will be processed shortly. A confirmation email has been sent to{" "}
                {order.shipping_email}.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-3 text-[#0064B1] mb-4">
                  <Package className="h-6 w-6" />
                  <p className="text-lg font-bold">
                    Order #{order.id.toString().padStart(6, "0")}
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-center gap-2 text-zinc-600">
                    <Clock className="h-4 w-4" />
                    <p>Estimated delivery: 3-5 business days</p>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Shipping Address:</h3>
                    <p className="text-zinc-600">
                      {order.shipping_address}
                      <br />
                      {order.shipping_city}, {order.shipping_state}{" "}
                      {order.shipping_zip}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Order Summary:</h3>
                    <div className="space-y-2 text-zinc-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          {parseFloat(order.shipping_fee) > 0
                            ? `$${formatPrice(order.shipping_fee)}`
                            : "FREE"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${formatPrice(order.tax)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total</span>
                        <span>${formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/orders">View Order Status</Link>
                </Button>
                <Button asChild>
                  <Link href="/listings">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
