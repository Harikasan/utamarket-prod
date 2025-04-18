"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/WishlistButton";
import { RatingSummary } from "@/components/RatingSummary";

export function ProductCard({
  id,
  name,
  price,
  image,
  itemDetails,
  category,
  discount,
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

  // Parse sizes from itemDetails if available
  const availableSizes = itemDetails?.Size ? itemDetails.Size.split(",") : [];

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
            {itemDetails?.Color && (
              <Badge className="bg-blue-600">{itemDetails.Color}</Badge>
            )}
          </div>
        </div>
      </Link>
      <div className="flex flex-col flex-grow p-4">
        <div className="flex-grow">
          <div className="text-sm text-zinc-500 mb-1">
            {category || itemDetails?.Type}
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
          <div className="mt-2">
            <RatingSummary productId={id} />
          </div>
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
              discount,
              originalPrice,
            }}
          />
        </div>
      </div>
    </div>
  );
}
