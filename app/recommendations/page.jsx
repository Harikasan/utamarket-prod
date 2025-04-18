"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        console.log("Fetching recommendations...");
        const response = await fetch("/api/recommendations");
        console.log("Response status:", response.status);

        if (response.status === 401) {
          console.log("User not authenticated, redirecting to login");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.error || "Failed to fetch recommendations");
        }

        const data = await response.json();
        console.log("Recommendations received:", data.length);
        setRecommendations(data);
      } catch (error) {
        console.error("Detailed error:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [router]);

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
        <Footer />
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
        <Footer />
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
              Recommended for You
            </h1>
            <p className="text-zinc-600 text-center max-w-2xl">
              Products picked just for you based on your interests and shopping
              history
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
              <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
                No recommendations yet
              </h2>
              <p className="text-zinc-600 mb-8">
                Browse our products and interact with them to get personalized
                recommendations!
              </p>
              <Button asChild>
                <Link href="/listings">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </main>
      <Footer />
    </>
  );
}
