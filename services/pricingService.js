// Pricing service to handle dynamic pricing calculations
class PricingService {
  constructor() {
    this.basePrice = 0;
    this.factors = {
      timeFactor: 1.0,
      demandFactor: 1.0,
      inventoryFactor: 1.0,
      userFactor: 1.0,
    };
  }

  // Set base price
  setBasePrice(price) {
    this.basePrice = price;
    return this;
  }

  // Time-based pricing adjustments
  applyTimeFactor(seasonalMultiplier = 1.0) {
    this.factors.timeFactor = seasonalMultiplier;
    return this;
  }

  // Demand-based pricing adjustments
  applyDemandFactor(salesVelocity, threshold = 10) {
    // If sales are above threshold, increase price
    this.factors.demandFactor = salesVelocity > threshold ? 1.1 : 1.0;
    return this;
  }

  // Inventory-based pricing adjustments
  applyInventoryFactor(currentStock, minStock = 5) {
    // If stock is low, increase price
    this.factors.inventoryFactor = currentStock <= minStock ? 1.15 : 1.0;
    return this;
  }

  // User-based pricing adjustments
  applyUserFactor(userType = "regular") {
    switch (userType) {
      case "student":
        this.factors.userFactor = 0.9; // 10% discount for students
        break;
      case "faculty":
        this.factors.userFactor = 0.85; // 15% discount for faculty
        break;
      case "alumni":
        this.factors.userFactor = 0.95; // 5% discount for alumni
        break;
      default:
        this.factors.userFactor = 1.0;
    }
    return this;
  }

  // Calculate final price
  calculate() {
    const finalPrice =
      this.basePrice *
      this.factors.timeFactor *
      this.factors.demandFactor *
      this.factors.inventoryFactor *
      this.factors.userFactor;

    // Round to 2 decimal places
    return Math.round(finalPrice * 100) / 100;
  }
}

export default PricingService;
