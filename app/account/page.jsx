"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  ShoppingBag,
  Settings,
  Heart,
  MapPin,
  CreditCard,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      setProfileData(data.user);
    } catch (err) {
      setError(err.message);
      if (err.message === "Not authenticated") {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0064B1]"></div>
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
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {error && !error.includes("Not authenticated") && (
              <div className="mb-6 p-4 text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#0064B1] text-white p-3 rounded-full">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profileData?.name}
                    </h1>
                    <p className="text-gray-500">
                      Member since {profileData?.joinDate}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profileData?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium">{profileData?.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{profileData?.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">
                        {profileData?.phoneNumber || "Not provided"}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Address Information
                  </h2>
                  {profileData?.addressLine1 ? (
                    <div className="space-y-2">
                      <p className="font-medium">{profileData.addressLine1}</p>
                      {profileData.addressLine2 && (
                        <p className="font-medium">
                          {profileData.addressLine2}
                        </p>
                      )}
                      <p className="font-medium">
                        {profileData.city}, {profileData.state}{" "}
                        {profileData.zipCode}
                      </p>
                      <p className="font-medium">{profileData.country}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No address provided</p>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h2>
                  {profileData?.cardLastFour ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">
                          {profileData.preferredPaymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Card Details</p>
                        <p className="font-medium">
                          {profileData.cardType} ending in{" "}
                          {profileData.cardLastFour}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {profileData.cardExpiryMonth}/
                          {profileData.cardExpiryYear}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No payment method saved</p>
                  )}
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/orders")}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/wishlist")}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      My Wishlist
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
