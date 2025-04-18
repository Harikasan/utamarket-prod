import { useState, useEffect } from "react";
import { Star, StarHalf, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Reviews({ productId }) {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, reviewText: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchUserData();
  }, [productId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/current-user");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        if (data) {
          fetchUserOrders();
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`/api/orders?productId=${productId}`);
      const data = await response.json();
      if (response.ok) {
        setUserOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.orderId) {
      toast.error("Please select a rating and order");
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
          orderId: newReview.orderId,
          rating: newReview.rating,
          reviewText: newReview.reviewText,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Review added successfully");
        setShowReviewForm(false);
        setNewReview({ rating: 0, reviewText: "" });
        fetchReviews();
      } else {
        toast.error(data.error || "Failed to add review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Review deleted successfully");
        fetchReviews();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <StarHalf
            key={i}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reviews</h2>
        {user &&
          userOrders.length > 0 &&
          !reviews.some((r) => r.user_id === user.userId) && (
            <Button onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          )}
      </div>

      {showReviewForm && (
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">Write a Review</h3>
          <select
            className="w-full p-2 border rounded"
            value={newReview.orderId}
            onChange={(e) =>
              setNewReview({ ...newReview, orderId: e.target.value })
            }
          >
            <option value="">Select Order</option>
            {userOrders.map((order) => (
              <option key={order.id} value={order.id}>
                Order #{order.id} -{" "}
                {new Date(order.order_date).toLocaleDateString()}
              </option>
            ))}
          </select>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setNewReview({ ...newReview, rating })}
                className="focus:outline-none"
              >
                {rating <= newReview.rating ? (
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ) : (
                  <Star className="w-6 h-6 text-gray-300" />
                )}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write your review..."
            value={newReview.reviewText}
            onChange={(e) =>
              setNewReview({ ...newReview, reviewText: e.target.value })
            }
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{review.user_name}</p>
                  <p className="text-sm text-gray-500">{review.student_id}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="mt-2">{review.review_text}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
              {user && user.userId === review.user_id && (
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="mt-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
