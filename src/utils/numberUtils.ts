// Utility functions for handling MongoDB string values

/**
 * Safely parse a string to number, with fallback
 */
export const parseNumber = (value: string | number | undefined | null): number => {
  if (typeof value === 'number') return value;
  if (!value || value === '') return 0;
  const parsed = parseFloat(value.toString());
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format price as currency string
 */
export const formatPrice = (price: string | number): string => {
  const numPrice = parseNumber(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numPrice);
};

/**
 * Format number as string for MongoDB
 */
export const formatNumberToString = (value: number | string): string => {
  if (typeof value === 'string') return value;
  return value.toString();
};

/**
 * Calculate subtotal (price * quantity)
 */
export const calculateSubtotal = (price: string, quantity: string): string => {
  const priceNum = parseNumber(price);
  const quantityNum = parseNumber(quantity);
  return (priceNum * quantityNum).toString();
};

/**
 * Add two string numbers together
 */
export const addStringNumbers = (a: string, b: string): string => {
  const numA = parseNumber(a);
  const numB = parseNumber(b);
  return (numA + numB).toString();
};

/**
 * Parse integer from string
 */
export const parseIntegerSafe = (value: string | number | undefined | null): number => {
  if (typeof value === 'number') return Math.floor(value);
  if (!value || value === '') return 0;
  const parsed = Number.parseInt(value.toString(), 10);
  return isNaN(parsed) ? 0 : parsed;
};
