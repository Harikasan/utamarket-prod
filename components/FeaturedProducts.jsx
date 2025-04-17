"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { WishlistButton } from "@/components/WishlistButton";

export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [hasSales, setHasSales] = useState(false);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products/featured");
        if (!response.ok) {
          throw new Error("Failed to fetch featured products");
        }
        const data = await response.json();
        setProducts(data.products);
        setHasSales(data.hasSales);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        const response = await fetch("/api/recommendations");
        if (response.status === 401) {
          // User not logged in - we'll handle this gracefully by not showing the section
          setRecommendations([]);
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data = await response.json();
        setRecommendations(data.slice(0, 4)); // Only take first 4 recommendations
      } catch (err) {
        setRecommendationsError(err.message);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchFeaturedProducts();
    fetchRecommendations();
  }, []);

  const formatPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0064B1]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-[#0064B1]">
                {hasSales ? "Best Selling Products" : "Featured Products"}
              </h2>
              <p className="text-zinc-600">
                {hasSales
                  ? "Our most popular items loved by UTA students and alumni"
                  : "Discover our handpicked selection of UTA merchandise"}
              </p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link href="/listings">View All Products</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {product.discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        {product.discount}% OFF
                      </Badge>
                    )}
                    {hasSales && (
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        {product.totalSales} sold
                      </Badge>
                    )}
                  </div>
                </Link>
                <div className="flex flex-col flex-grow p-4">
                  <div className="flex-grow">
                    <div className="text-sm text-zinc-500 mb-1">
                      {product.category}
                    </div>
                    <h3 className="font-medium text-zinc-900 group-hover:text-[#0064B1] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-semibold text-[#0064B1]">
                        ${formatPrice(product.price)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-zinc-400 line-through">
                          ${formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400"
                              : "text-zinc-200"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-zinc-500 ml-1">
                        ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      asChild
                      className="flex-1 bg-[#0064B1] hover:bg-[#0064B1]/90"
                    >
                      <Link href={`/product/${product.id}`}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                    <WishlistButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                        rating: product.rating,
                        reviewCount: product.reviewCount,
                        discount: product.discount,
                        originalPrice: product.originalPrice,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="py-16 bg-zinc-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-[#0064B1]">
                  Recommended For You
                </h2>
                <p className="text-zinc-600">
                  Personalized picks based on your shopping history
                </p>
              </div>
              <Button asChild variant="outline" className="mt-4 md:mt-0">
                <Link href="/recommendations">View All Recommendations</Link>
              </Button>
            </div>

            {loadingRecommendations ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0064B1]"></div>
              </div>
            ) : recommendationsError ? (
              <div className="text-center text-red-600">
                Error loading recommendations
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendations.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                  >
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge className="absolute top-2 right-2 bg-purple-600">
                          Recommended
                        </Badge>
                      </div>
                    </Link>
                    <div className="flex flex-col flex-grow p-4">
                      <div className="flex-grow">
                        <div className="text-sm text-zinc-500 mb-1">
                          {product.category}
                        </div>
                        <h3 className="font-medium text-zinc-900 group-hover:text-[#0064B1] transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="mt-2">
                          <span className="text-lg font-semibold text-[#0064B1]">
                            ${formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          asChild
                          className="flex-1 bg-[#0064B1] hover:bg-[#0064B1]/90"
                        >
                          <Link href={`/product/${product.id}`}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </Button>
                        <WishlistButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image_url,
                            category: product.category,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
