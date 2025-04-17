"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Save,
  User,
  Lock,
  Shield,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Grid,
  List,
  Eye,
  Trash2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    email: "",
    studentId: "",
    dateOfBirth: "",
    phoneNumber: "",

    // Address Information
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",

    // Payment Information
    preferredPaymentMethod: "Credit Card",
    cardLastFour: "",
    cardType: "",
    cardExpiryMonth: "",
    cardExpiryYear: "",

    // Password Change
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    // Notification Settings
    emailNotifications: true,
    orderUpdates: true,
    promotionalOffers: false,

    // Platform Settings
    theme: "light",

    // Display Preferences
    productsPerPage: 12,
    defaultSort: "newest",

    // Shopping Preferences
    defaultShippingAddress: "",
    preferredPaymentMethod: "credit_card",
    savePaymentInfo: false,
  });

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
      setFormData((prev) => ({
        ...prev,
        name: data.user.name,
        email: data.user.email,
        studentId: data.user.studentId,
        dateOfBirth: data.user.dateOfBirth,
        phoneNumber: data.user.phoneNumber || "",
        addressLine1: data.user.addressLine1 || "",
        addressLine2: data.user.addressLine2 || "",
        city: data.user.city || "",
        state: data.user.state || "",
        zipCode: data.user.zipCode || "",
        country: data.user.country || "USA",
        preferredPaymentMethod:
          data.user.preferredPaymentMethod || "Credit Card",
        cardLastFour: data.user.cardLastFour || "",
        cardType: data.user.cardType || "",
        cardExpiryMonth: data.user.cardExpiryMonth || "",
        cardExpiryYear: data.user.cardExpiryYear || "",
      }));
    } catch (err) {
      setError(err.message);
      if (err.message === "Not authenticated") {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Email validation
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push("Please enter a valid email address");
    }

    // Student ID validation (assuming format: 10 digits)
    if (!formData.studentId.match(/^\d{10}$/)) {
      errors.push("Student ID must be 10 digits");
    }

    // Phone number validation
    if (
      formData.phoneNumber &&
      !formData.phoneNumber.match(/^\+?[\d\s-()]{10,}$/)
    ) {
      errors.push("Please enter a valid phone number");
    }

    // Password validation (if changing)
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.push("Passwords do not match");
      }
    }

    // Address validation
    if (formData.addressLine1 && !formData.city) {
      errors.push("City is required when address is provided");
    }
    if (formData.addressLine1 && !formData.state) {
      errors.push("State is required when address is provided");
    }
    if (formData.addressLine1 && !formData.zipCode) {
      errors.push("ZIP code is required when address is provided");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      return;
    }

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      setSuccess("Settings updated successfully!");
      setIsEditing(false);
      fetchProfileData(); // Refresh profile data
    } catch (err) {
      setError(err.message);
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
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            {error && (
              <div className="mb-6 p-4 text-red-600 bg-red-50 rounded-lg whitespace-pre-line">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 text-green-600 bg-green-50 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </h2>
                  {!isEditing && (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </Card>

              {/* Address Information */}
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preferredPaymentMethod">
                      Preferred Payment Method
                    </Label>
                    <select
                      id="preferredPaymentMethod"
                      name="preferredPaymentMethod"
                      value={formData.preferredPaymentMethod}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                  {formData.preferredPaymentMethod !== "PayPal" && (
                    <>
                      <div>
                        <Label htmlFor="cardLastFour">
                          Last 4 Digits of Card
                        </Label>
                        <Input
                          id="cardLastFour"
                          name="cardLastFour"
                          value={formData.cardLastFour}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          maxLength={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardType">Card Type</Label>
                        <select
                          id="cardType"
                          name="cardType"
                          value={formData.cardType}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Card Type</option>
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="American Express">
                            American Express
                          </option>
                          <option value="Discover">Discover</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiryMonth">Expiry Month</Label>
                          <Input
                            id="cardExpiryMonth"
                            name="cardExpiryMonth"
                            value={formData.cardExpiryMonth}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardExpiryYear">Expiry Year</Label>
                          <Input
                            id="cardExpiryYear"
                            name="cardExpiryYear"
                            value={formData.cardExpiryYear}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Password Settings */}
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Password Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          emailNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Order Updates</Label>
                      <p className="text-sm text-gray-500">
                        Get notified about order status changes
                      </p>
                    </div>
                    <Switch
                      checked={formData.orderUpdates}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          orderUpdates: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Promotional Offers</Label>
                      <p className="text-sm text-gray-500">
                        Receive promotional offers and discounts
                      </p>
                    </div>
                    <Switch
                      checked={formData.promotionalOffers}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          promotionalOffers: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Platform Settings */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Grid className="h-5 w-5 mr-2" />
                    Platform Settings
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Shopping Preferences */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Shopping Preferences
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Default shipping address</Label>
                        <Select
                          value={formData.defaultShippingAddress}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              defaultShippingAddress: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select default address" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home Address</SelectItem>
                            <SelectItem value="work">Work Address</SelectItem>
                            <SelectItem value="other">Other Address</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Preferred payment method</Label>
                        <Select
                          value={formData.preferredPaymentMethod}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              preferredPaymentMethod: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit_card">
                              Credit Card
                            </SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="bank_transfer">
                              Bank Transfer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Save payment information</Label>
                          <p className="text-sm text-gray-500">
                            Store payment details for faster checkout
                          </p>
                        </div>
                        <Switch
                          checked={formData.savePaymentInfo}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              savePaymentInfo: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {isEditing && (
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#0064B1] hover:bg-[#0064B1]/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
