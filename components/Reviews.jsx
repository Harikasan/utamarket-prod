"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function Reviews({ productId, userId }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    comment: "",
  });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    checkCanReview();
  }, [productId, userId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `/api/reviews/can-review?productId=${productId}&userId=${userId}`
      );
      const data = await response.json();
      setCanReview(data.canReview);
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please login to submit a review");
      return;
    }
    if (!canReview) {
      toast.error("You can only review products you have purchased");
      return;
    }
    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          userId,
          ...newReview,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      toast.success("Review submitted successfully");
      setNewReview({ rating: 0, title: "", comment: "" });
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!userId) {
      toast.error("Please login to delete a review");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Review Form */}
      {canReview && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rating:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= (hoverRating || newReview.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-zinc-200"
                    }`}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>
            <Input
              placeholder="Review Title"
              value={newReview.title}
              onChange={(e) =>
                setNewReview({ ...newReview, title: e.target.value })
              }
              required
            />
            <Textarea
              placeholder="Write your review..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              required
            />
            <Button type="submit">Submit Review</Button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-zinc-500">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{review.title}</span>
                </div>
                {review.user_id === userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-zinc-600">{review.comment}</p>
              <p className="text-sm text-zinc-500 mt-2">
                By {review.userName} on{" "}
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
