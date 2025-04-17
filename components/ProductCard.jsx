"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/WishlistButton";

export function ProductCard({
  id,
  name,
  price,
  image,
  itemDetails = { Type: "N/A", Color: "N/A", Size: "N/A" },
  category,
  rating = 0,
  reviewCount = 0,
  discount = 0,
  originalPrice,
}) {
  const formatPrice = (price) => {
    if (!price) return "0.00";
    const numPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^0-9.-]+/g, ""))
        : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  // Parse sizes from itemDetails
  const availableSizes = itemDetails.Size ? itemDetails.Size.split(",") : [];

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-red-500">{discount}% OFF</Badge>
            )}
            {itemDetails.Color && itemDetails.Color !== "N/A" && (
              <Badge className="bg-blue-600">{itemDetails.Color}</Badge>
            )}
          </div>
        </div>
      </Link>
      <div className="flex flex-col flex-grow p-4">
        <div className="flex-grow">
          <div className="text-sm text-zinc-500 mb-1">
            {category || itemDetails.Type}
          </div>
          <h3 className="font-medium text-zinc-900 group-hover:text-[#0064B1] transition-colors line-clamp-2">
            {name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold text-[#0064B1]">
              ${formatPrice(price)}
            </span>
            {discount > 0 && originalPrice && (
              <span className="text-sm text-zinc-400 line-through">
                ${formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) ? "text-yellow-400" : "text-zinc-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-zinc-500 ml-1">({reviewCount})</span>
          </div>
          {/* Show available sizes */}
          {availableSizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {availableSizes.map((size) => (
                <Badge key={size} variant="secondary" className="text-xs">
                  {size}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button asChild className="flex-1 bg-[#0064B1] hover:bg-[#0064B1]/90">
            <Link href={`/product/${id}`}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          <WishlistButton
            product={{
              id,
              name,
              price,
              image,
              itemDetails,
              category,
              rating,
              reviewCount,
              discount,
              originalPrice,
            }}
          />
        </div>
      </div>
    </div>
  );
}
