import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function SimilarProductCard({
  id,
  name,
  price,
  image,
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

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-[0.5/0.5] overflow-hidden rounded-t-lg">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              {discount}% OFF
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-2">
        <h3 className="font-medium text-zinc-900 group-hover:text-[#0064B1] transition-colors line-clamp-2 text-sm">
          {name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-semibold text-[#0064B1]">
            ${formatPrice(price)}
          </span>
          {discount > 0 && originalPrice && (
            <span className="text-xs text-zinc-400 line-through">
              ${formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
