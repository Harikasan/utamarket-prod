"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";

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
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                itemDetails={product.itemDetails}
                category={product.category}
                discount={product.discount}
                originalPrice={product.originalPrice}
              />
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
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image_url}
                    itemDetails={product.itemDetails}
                    category={product.category}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
