"use client";

import { useState, useEffect, use } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/ProductCard";
import Image from "next/image";
import { toast } from "sonner";
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useParams } from "next/navigation";
import { WishlistButton } from "@/components/WishlistButton";
import { Label } from "@/components/ui/label";

// This would normally come from a database or API
const getProductById = (id) => {
  // Sample product data for UTA merchandise
  return {
    id: id,
    name: "UTA Classic Hoodie",
    category: "Apparel",
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1565693413579-8ff3fdc1b03b?q=80&w=1974&auto=format&fit=crop",
    ],
    rating: 4.8,
    reviewCount: 156,
    description:
      "Stay warm and show your UTA pride with our Classic Hoodie. Made from premium cotton blend material, featuring the iconic UTA logo embroidered on the chest. Perfect for chilly days on campus or showing your school spirit anywhere you go.",
    details: [
      "80% Cotton, 20% Polyester blend",
      "Machine washable",
      "Ribbed cuffs and waistband",
      "Kangaroo pocket",
      "Drawstring hood",
      "Embroidered UTA logo",
    ],
    availableSizes: ["XS", "S", "M", "L", "XL", "2XL"],
    availableColors: ["Navy Blue", "Gray", "Orange", "White"],
    reviews: [
      {
        id: 1,
        user: "Sarah M.",
        rating: 5,
        date: "March 15, 2024",
        comment:
          "Super comfortable and great quality! The size runs true to fit.",
        helpful: 24,
        notHelpful: 2,
      },
      {
        id: 2,
        user: "Mike R.",
        rating: 4,
        date: "March 10, 2024",
        comment:
          "Nice hoodie, but I wish it came in more colors. The material is very soft though!",
        helpful: 15,
        notHelpful: 1,
      },
      {
        id: 3,
        user: "Jessica L.",
        rating: 5,
        date: "March 5, 2024",
        comment:
          "Perfect for those chilly mornings on campus. The embroidery is really well done.",
        helpful: 19,
        notHelpful: 0,
      },
    ],
    aiRecommendations: [
      {
        id: 101,
        name: "UTA Logo T-Shirt",
        category: "Apparel",
        price: 24.99,
        image:
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964&auto=format&fit=crop",
        rating: 4.6,
        reason: "Perfect for layering with the hoodie",
      },
      {
        id: 102,
        name: "UTA Backpack",
        category: "Accessories",
        price: 39.99,
        image:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1974&auto=format&fit=crop",
        rating: 4.9,
        reason: "Complete your campus look",
      },
      {
        id: 103,
        name: "Maverick Pride Cap",
        category: "Accessories",
        price: 22.99,
        image:
          "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1936&auto=format&fit=crop",
        rating: 4.7,
        reason: "Customers often buy these together",
      },
    ],
  };
};

export default function ProductPage() {
  const params = useParams();
  const productId = params.id; // Now safely accessing the id parameter
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();

        // Parse sizes from item_details if available
        if (data.item_details?.Size) {
          data.availableSizes = data.item_details.Size.split(",");
        }

        setProduct(data);
        // Set initial size if available
        if (data.availableSizes?.length > 0) {
          setSelectedSize(data.availableSizes[0]);
        }
        if (data.availableColors?.length > 0) {
          setSelectedColor(data.availableColors[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      setCartMessage({ type: "", text: "" });

      // Validate size if sizes are available
      if (product.availableSizes?.length > 0 && !selectedSize) {
        toast.error("Please select a size");
        return;
      }

      // Validate color if colors are available
      if (product.availableColors?.length > 0 && !selectedColor) {
        toast.error("Please select a color");
        return;
      }

      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          selectedSize,
          selectedColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login page if not authenticated
          router.push(
            "/login?redirect=" + encodeURIComponent(window.location.pathname)
          );
          return;
        }
        throw new Error(data.message || "Failed to add item to cart");
      }

      // Show success toast with cart action
      toast.success("Added to cart!", {
        description: `${quantity}x ${product.name} added to your cart`,
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });

      // Reset selections
      setQuantity(1);
      if (product.availableSizes?.length > 0) {
        setSelectedSize(product.availableSizes[0]);
      }
      if (product.availableColors?.length > 0) {
        setSelectedColor(product.availableColors[0]);
      }
    } catch (err) {
      toast.error("Failed to add item to cart", {
        description: err.message,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on UTA Marketplace!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Failed to share product");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-zinc-600">{error || "Product not found"}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              {product.images && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg ${
                        selectedImage === index
                          ? "ring-2 ring-[#0064B1]"
                          : "ring-1 ring-zinc-200"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  {product.name}
                </h1>
                <p className="mt-2 text-zinc-500">{product.category}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0064B1]">
                  ${product.price}
                </span>
                {product.discount > 0 && product.originalPrice && (
                  <>
                    <span className="text-lg text-zinc-400 line-through">
                      ${product.originalPrice}
                    </span>
                    <Badge className="bg-red-500">
                      {product.discount}% OFF
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-zinc-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-zinc-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <Separator />

              {/* Size Selection */}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-900">
                    Size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.availableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              {product.availableColors &&
                product.availableColors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">
                      Color
                    </label>
                    <Select
                      value={selectedColor}
                      onValueChange={setSelectedColor}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.availableColors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {/* Quantity Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">
                  Quantity
                </label>
                <Select
                  value={quantity.toString()}
                  onValueChange={(value) => setQuantity(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  className="flex-1 bg-[#0064B1] hover:bg-[#0064B1]/90"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <WishlistButton product={product} />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Share this product"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Product Description */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Description
                </h2>
                <p className="text-zinc-600">{product.description}</p>
              </div>

              {/* Product Details */}
              {product.details && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Product Details
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-zinc-600">
                    {product.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
