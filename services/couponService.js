// Coupon service to handle coupon validation and discount calculations
class CouponService {
  constructor() {
    this.validCoupons = {
      STUDENT: { discount: 0.1, description: "10% Student Discount" },
      FACULTY: { discount: 0.15, description: "15% Faculty Discount" },
      ALUMNI: { discount: 0.05, description: "5% Alumni Discount" },
    };
  }

  // Validate coupon code
  validateCoupon(code) {
    const coupon = this.validCoupons[code.toUpperCase()];
    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }
    return {
      valid: true,
      discount: coupon.discount,
      description: coupon.description,
    };
  }

  // Calculate discount amount
  calculateDiscount(subtotal, couponCode) {
    const validation = this.validateCoupon(couponCode);
    if (!validation.valid) {
      return {
        discountAmount: 0,
        finalAmount: subtotal,
        error: validation.message,
      };
    }

    const discountAmount = subtotal * validation.discount;
    const finalAmount = subtotal - discountAmount;

    return {
      discountAmount,
      finalAmount,
      description: validation.description,
    };
  }
}

export default CouponService;
