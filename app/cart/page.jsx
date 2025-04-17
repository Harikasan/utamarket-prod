"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      const response = await fetch("/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUpdateMessage({ type: "error", text: data.message });
        return;
      }

      setUpdateMessage({ type: "success", text: "Cart updated successfully" });
      fetchCart();
    } catch (err) {
      setUpdateMessage({ type: "error", text: "Failed to update cart" });
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(true);
      const response = await fetch("/api/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUpdateMessage({ type: "error", text: data.message });
        return;
      }

      setUpdateMessage({ type: "success", text: "Item removed successfully" });
      fetchCart();
    } catch (err) {
      setUpdateMessage({ type: "error", text: "Failed to remove item" });
    } finally {
      setUpdating(false);
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
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
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-zinc-600">{error}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-zinc-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {updateMessage && (
          <div
            className={`mb-4 p-4 rounded ${
              updateMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {updateMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
              >
                {/* Product Image */}
                <Link
                  href={`/product/${item.productId}`}
                  className="shrink-0 aspect-square w-24 relative rounded-md overflow-hidden"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <Link
                      href={`/product/${item.productId}`}
                      className="font-medium hover:text-[#0064B1]"
                    >
                      {item.name}
                    </Link>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-600 mb-4">
                    {item.category}
                    {item.selectedSize && ` • Size: ${item.selectedSize}`}
                    {item.selectedColor && ` • Color: ${item.selectedColor}`}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity === 1 || updating}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        disabled={
                          item.quantity === item.stockQuantity || updating
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.summary?.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {cart.summary?.shipping > 0
                      ? `$${cart.summary?.shipping.toFixed(2)}`
                      : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${cart.summary?.tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center font-bold text-xl mb-4">
                <span>Total</span>
                <span>${cart.summary?.total.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
