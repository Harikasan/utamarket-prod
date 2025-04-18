import { NextResponse } from "next/server";

// Sample coupon database - in a real app, this would be in a database
const COUPONS = {
  WELCOME10: {
    code: "WELCOME10",
    discount: 0.1, // 10% discount
    minPurchase: 0,
    maxDiscount: 50,
    type: "percentage",
  },
  SAVE20: {
    code: "SAVE20",
    discount: 20, // $20 flat discount
    minPurchase: 100,
    type: "fixed",
  },
  SUMMER25: {
    code: "SUMMER25",
    discount: 0.25, // 25% discount
    minPurchase: 50,
    maxDiscount: 100,
    type: "percentage",
  },
  FREESHIP: {
    code: "FREESHIP",
    discount: 0, // Special case for free shipping
    minPurchase: 0,
    type: "shipping",
  },
};

export async function POST(request) {
  try {
    const { code, cartTotal } = await request.json();

    // Check if coupon exists
    const coupon = COUPONS[code];
    if (!coupon) {
      return NextResponse.json(
        { message: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // Check minimum purchase requirement
    if (cartTotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          message: `Minimum purchase of $${coupon.minPurchase} required for this coupon`,
        },
        { status: 400 }
      );
    }

    // Calculate discount based on type
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = cartTotal * coupon.discount;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === "fixed") {
      discount = coupon.discount;
    } else if (coupon.type === "shipping") {
      // For free shipping, we'll need to handle this differently in the frontend
      discount = 0;
    }

    return NextResponse.json({
      code: coupon.code,
      discount: Number(discount.toFixed(2)),
      type: coupon.type,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { message: "Error validating coupon" },
      { status: 500 }
    );
  }
}
