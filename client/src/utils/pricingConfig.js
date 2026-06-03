// client/src/utils/pricingConfig.js

// Define price tiers based on quantity
export const priceTiers = [
  { minQty: 1, maxQty: 10, multiplier: 1.0, label: "Retail Price", discount: "0%" },
  { minQty: 11, maxQty: 50, multiplier: 0.95, label: "Bulk Purchase", discount: "5% off" },
  { minQty: 51, maxQty: 100, multiplier: 0.90, label: "Wholesale", discount: "10% off" },
  { minQty: 101, maxQty: 500, multiplier: 0.85, label: "Distributor", discount: "15% off" },
  { minQty: 501, maxQty: Infinity, multiplier: 0.80, label: "Super Wholesale", discount: "20% off" }
];

// Calculate price based on base price and quantity
export const calculateTieredPrice = (basePrice, quantity) => {
  if (!basePrice || basePrice <= 0) return 0;
  if (!quantity || quantity <= 0) return basePrice;
  
  const tier = priceTiers.find(tier => 
    quantity >= tier.minQty && quantity <= tier.maxQty
  );
  
  const discountedPrice = basePrice * tier.multiplier;
  return Math.round(discountedPrice * 100) / 100;
};

// Get price tier label based on quantity
export const getPriceTierLabel = (quantity) => {
  if (!quantity) return priceTiers[0].label;
  const tier = priceTiers.find(tier => 
    quantity >= tier.minQty && quantity <= tier.maxQty
  );
  return tier.label;
};

// Calculate savings
export const calculateSavings = (basePrice, quantity, discountedPrice) => {
  const originalTotal = basePrice * quantity;
  const actualTotal = discountedPrice * quantity;
  const savings = originalTotal - actualTotal;
  const savingsPercent = ((savings / originalTotal) * 100).toFixed(1);
  
  return {
    originalPricePerUnit: basePrice,
    finalPricePerUnit: discountedPrice,
    originalTotal: originalTotal.toFixed(2),
    actualTotal: actualTotal.toFixed(2),
    savings: savings.toFixed(2),
    savingsPercent
  };
};