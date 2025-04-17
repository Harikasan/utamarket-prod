import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function WishlistButton({ className = "", product }) {
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if product is in wishlist on component mount
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch("/api/wishlist");
        if (response.status === 401) {
          return; // User not logged in
        }
        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }
        const items = await response.json();
        setIsInWishlist(items.some((item) => item.id === product.id));
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  const toggleWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update wishlist");
      }

      setIsInWishlist(!isInWishlist);

      if (!isInWishlist) {
        // Added to wishlist
        toast.success("Added to wishlist", {
          description: `${product.name} has been added to your wishlist`,
          action: {
            label: "View Wishlist",
            onClick: () => router.push("/wishlist"),
          },
        });
      } else {
        // Removed from wishlist
        toast.info("Removed from wishlist", {
          description: `${product.name} has been removed from your wishlist`,
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                const response = await fetch("/api/wishlist", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ productId: product.id }),
                });

                if (!response.ok) {
                  throw new Error("Failed to restore item");
                }

                setIsInWishlist(true);
                toast.success("Item restored to wishlist");
              } catch (error) {
                console.error("Error restoring item:", error);
                toast.error("Failed to restore item");
              }
            },
          },
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`shrink-0 ${className}`}
      onClick={(e) => {
        e.preventDefault();
        if (!isLoading) {
          toggleWishlist();
        }
      }}
      disabled={isLoading}
    >
      <Heart
        className={`h-4 w-4 ${
          isLoading
            ? "animate-pulse"
            : isInWishlist
            ? "fill-red-500 text-red-500"
            : ""
        }`}
      />
    </Button>
  );
}
