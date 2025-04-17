"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Home,
  Star,
  BookOpen,
  PhoneCall,
  ShoppingCart,
  User,
  Package,
  Grid,
  LogIn,
  UserPlus,
  Search,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        // Check if user is admin
        setIsAdmin(
          data.user.email === "admin@mavs.uta.edu" && data.user.name === "admin"
        );
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Call logout API endpoint to handle server-side cleanup
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear auth cookie with proper attributes
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict";

      // Update auth state
      setIsAuthenticated(false);
      setIsAdmin(false);

      // Redirect to home page
      router.push("/");
      router.refresh(); // Force a refresh to update all components
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the API call fails, we should still clear local state
      setIsAuthenticated(false);
      setIsAdmin(false);
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Image
                src="/uta-star.png"
                alt="UTA Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="flex">
              <span className="text-zinc-800">UTA</span>
              <span className="text-[#0064B1]">Market</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {/* Main Navigation */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/">
                  <Home className="h-5 w-5 text-[#0064B1]" />
                  <span className="text-zinc-700">Home</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/listings">
                  <Grid className="h-5 w-5 text-[#0064B1]" />
                  <span className="text-zinc-700">All Products</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/featured">
                  <Star className="h-5 w-5 text-[#0064B1]" />
                  <span className="text-zinc-700">Featured</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/blog">
                  <BookOpen className="h-5 w-5 text-[#0064B1]" />
                  <span className="text-zinc-700">Blog</span>
                </Link>
              </Button>
              {isAdmin ? (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/contact-admin">
                    <PhoneCall className="h-5 w-5 text-[#0064B1]" />
                    <span className="text-zinc-700">Contact Admin</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/contact">
                    <PhoneCall className="h-5 w-5 text-[#0064B1]" />
                    <span className="text-zinc-700">Contact Us</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4 pl-6 border-l border-zinc-200">
              {/* Admin Button - Only show if user is admin */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href="/admin">
                    <Settings className="h-5 w-5 text-[#0064B1]" />
                    <span className="text-zinc-700">Admin</span>
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5 text-[#0064B1]" />
                  <span className="text-zinc-700">Cart</span>
                </Link>
              </Button>

              {/* Account Dropdown */}
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#0064B1]" />
                      <span className="text-zinc-700">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {isAuthenticated ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/account" className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            <span>My Account</span>
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center">
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="flex items-center text-red-600"
                          disabled={isLoggingOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>
                            {isLoggingOut ? "Logging out..." : "Logout"}
                          </span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/login" className="flex items-center">
                            <LogIn className="mr-2 h-4 w-4" />
                            <span>Sign In</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/signup" className="flex items-center">
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Create Account</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                variant="ghost"
                className="flex items-center gap-2"
                asChild
              >
                <Link href="/orders">
                  <Package className="h-5 w-5 text-[#0064B1]" />
                  <span className="text-zinc-700">Orders</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
