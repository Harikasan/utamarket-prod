"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Shield,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "TX",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    fetchCart();
  }, []);

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

  const validateShippingInfo = () => {
    if (!formData.firstName) return "First name is required";
    if (!formData.lastName) return "Last name is required";
    if (!formData.email) return "Email is required";
    if (!formData.phone) return "Phone number is required";
    if (!formData.address) return "Address is required";
    if (!formData.city) return "City is required";
    if (!formData.state) return "State is required";
    if (!formData.zipCode) return "ZIP code is required";
    return null;
  };

  const validatePaymentInfo = () => {
    if (!formData.cardNumber) return "Card number is required";
    if (!formData.cardName) return "Name on card is required";
    if (!formData.expiryDate) return "Expiry date is required";
    if (!formData.cvv) return "CVV is required";
    if (formData.cardNumber.replace(/\s/g, "").length !== 16)
      return "Invalid card number";
    if (formData.cvv.length !== 3) return "Invalid CVV";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      const error = validateShippingInfo();
      if (error) {
        toast.error(error);
        return;
      }
      setStep(2);
      return;
    }

    const error = validatePaymentInfo();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setProcessing(true);

      // Process the order
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          paymentInfo: {
            cardNumber: formData.cardNumber,
            cardName: formData.cardName,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
          },
          cartId: cart.id,
          items: cart.items,
          subtotal: cart.summary.subtotal,
          shipping: cart.summary.shipping,
          tax: cart.summary.tax,
          total: cart.summary.total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      // Show success message
      toast.success("Order placed successfully!", {
        description: "You will receive a confirmation email shortly.",
      });

      // Redirect to order confirmation page
      router.push(`/checkout/${data.orderId}/confirmation`);
    } catch (err) {
      toast.error("Failed to place order", {
        description: err.message,
      });
    } finally {
      setProcessing(false);
    }
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

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Package className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-zinc-600 mb-8">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Button asChild>
                <Link href="/listings">Browse Products</Link>
              </Button>
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
        {/* Hero Section */}
        <div className="bg-[#0064B1] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="h-6 w-6 text-[#0064B1]" />
                    <h2 className="text-xl font-bold">Shipping Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          setFormData({ ...formData, state: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TX">Texas</SelectItem>
                          {/* Add other states as needed */}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            zipCode: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                {step === 2 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="h-6 w-6 text-[#0064B1]" />
                      <h2 className="text-xl font-bold">Payment Information</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cardNumber: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 16),
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cardName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                expiryDate: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            maxLength={3}
                            value={formData.cvv}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cvv: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 3),
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button type="submit" className="w-full" disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : step === 1 ? (
                    "Continue to Payment"
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-zinc-600">
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                          {item.selectedSize && item.selectedColor && " • "}
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                          {" • "}Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-6 pt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Subtotal</span>
                    <span>${cart.summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Shipping</span>
                    <span>
                      {cart.summary.shipping > 0
                        ? `$${cart.summary.shipping.toFixed(2)}`
                        : "FREE"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Tax</span>
                    <span>${cart.summary.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${cart.summary.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Delivery within 3-5 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
