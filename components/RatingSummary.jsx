import { Star, StarHalf } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function RatingSummary({ productId }) {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rating data");
        }
        const reviews = await response.json();

        // Calculate average rating and count
        const totalRating = reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const averageRating =
          reviews.length > 0 ? totalRating / reviews.length : 0;

        setRating(averageRating);
        setReviewCount(reviews.length);
      } catch (error) {
        console.error("Error fetching rating data:", error);
        toast.error("Failed to load rating data");
        setRating(0);
        setReviewCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRatingData();
    }
  }, [productId]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-200 animate-pulse" />
          ))}
        </div>
        <span className="text-sm text-zinc-600 animate-pulse">Loading...</span>
      </div>
    );
  }

  if (reviewCount === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-300" />
          ))}
        </div>
        <span className="text-sm text-zinc-600">No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">{renderStars(rating)}</div>
      <span className="text-sm text-zinc-600">
        ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}
