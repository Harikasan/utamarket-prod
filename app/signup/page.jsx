"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import Image from "next/image";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    dateOfBirth: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // Basic validation
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.studentId ||
        !formData.dateOfBirth
      ) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      if (!formData.email.endsWith("@mavs.uta.edu")) {
        setError("Please use your UTA email address (@mavs.uta.edu)");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (!formData.agreeToTerms) {
        setError("Please agree to the Terms of Service and Privacy Policy");
        setIsLoading(false);
        return;
      }

      // Log the data being sent to backend
      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        dateOfBirth: formData.dateOfBirth,
        agreeToTerms: formData.agreeToTerms,
      };

      console.log("Sending signup data:", {
        ...requestData,
        password: "[REDACTED]", // Don't log actual password
      });

      // Send signup request to backend
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log("Response from server:", data); // Log the response

      if (!response.ok) {
        throw new Error(
          data.errors?.[0] || data.message || "Registration failed"
        );
      }

      // Handle successful signup
      setSuccessMessage("Registration successful! Redirecting to login...");
      localStorage.setItem("authToken", data.token);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        studentId: "",
        dateOfBirth: "",
        agreeToTerms: false,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src="/uta-star.png"
                    alt="UTA Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#0064B1] mb-2">
                Create Account
              </h1>
              <p className="text-zinc-600">
                Join UTAMarket to start shopping and selling
              </p>
            </div>

            {/* Signup Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                    {successMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">UTA Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@mavs.uta.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="1000XXXXXX"
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, agreeToTerms: checked })
                    }
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-zinc-600">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-[#0064B1] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#0064B1] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0064B1] hover:bg-[#004f8a] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create Account
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Login Link */}
            <p className="text-center mt-6 text-zinc-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0064B1] hover:underline">
                Sign in
              </Link>
            </p>

            {/* Additional Info */}
            <div className="mt-8 text-center text-sm text-zinc-500">
              <p>Need help? Contact support at</p>
              <a
                href="mailto:support@utamarket.com"
                className="text-[#0064B1] hover:underline"
              >
                support@utamarket.com
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
