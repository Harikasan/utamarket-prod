"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
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
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      if (!formData.email.endsWith("@mavs.uta.edu")) {
        setError("Please use your UTA email address (@mavs.uta.edu)");
        setIsLoading(false);
        return;
      }

      // Send login request
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Handle successful login
      setSuccessMessage("Login successful! Redirecting to your account...");

      // Store user info in client storage
      const userInfo = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      };

      if (formData.rememberMe) {
        localStorage.setItem("user", JSON.stringify(userInfo));
      } else {
        sessionStorage.setItem("user", JSON.stringify(userInfo));
      }

      // Reset form
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });

      // Redirect to account page after 1 second
      setTimeout(() => {
        router.push("/account");
      }, 1000);
    } catch (err) {
      setError(err.message || "An error occurred during login");
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
                Welcome Back
              </h1>
              <p className="text-zinc-600">Sign in to your UTAMarket account</p>
            </div>

            {/* Login Form */}
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
                  <Label htmlFor="email">UTA Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@mavs.uta.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#0064B1] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rememberMe: checked })
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-zinc-600 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0064B1] hover:bg-[#004f8a]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-zinc-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#0064B1] hover:underline">
                Create one now
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
