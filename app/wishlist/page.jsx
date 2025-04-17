"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/wishlist");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }

        const data = await response.json();
        setWishlistItems(data);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const formatPrice = (price) => {
    if (!price) return "0.00";
    const numPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^0-9.-]+/g, ""))
        : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-[#0064B1]" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">
                Error
              </h2>
              <p className="text-zinc-600 mb-8">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center mb-12">
            <h1 className="text-4xl font-bold text-[#0064B1] mb-4">
              My Wishlist
            </h1>
            <p className="text-zinc-600 text-center max-w-2xl">
              Keep track of all your favorite UTA merchandise in one place.
            </p>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
              <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-zinc-600 mb-8">
                Browse our collection and add items to your wishlist!
              </p>
              <Button asChild>
                <Link href="/listings">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {wishlistItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            <Link
                              href={`/product/${product.id}`}
                              className="hover:text-[#0064B1]"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {product.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-[#0064B1]">
                              ${formatPrice(product.price)}
                            </p>
                            {product.discount > 0 && product.original_price && (
                              <p className="text-sm text-gray-500 line-through">
                                ${formatPrice(product.original_price)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/product/${product.id}`}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <WishlistButton product={product} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
