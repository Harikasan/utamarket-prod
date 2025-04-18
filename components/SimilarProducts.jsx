import { useEffect, useState } from "react";
import { SimilarProductCard } from "./SimilarProductCard";

export function SimilarProducts({ currentProductId, category }) {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/products/similar?category=${encodeURIComponent(
            category
          )}&exclude=${currentProductId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch similar products");
        }
        const data = await response.json();
        setSimilarProducts(data);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchSimilarProducts();
    }
  }, [category, currentProductId]);

  if (loading) {
    return <div className="animate-pulse">Loading similar products...</div>;
  }

  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold mb-6">Similar Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {similarProducts.map((product) => (
          <SimilarProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            category={product.category}
            discount={product.discount}
            originalPrice={product.originalPrice}
          />
        ))}
      </div>
    </section>
  );
}
