import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Enhanced Indian Currency Formatter
export function formatCurrency(amount, options = {}) {
  const {
    showSymbol = true,
    abbreviated = true,
    decimals = 0
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const absAmount = Math.abs(amount);
  let formattedAmount;
  let suffix = '';

  if (abbreviated) {
    if (absAmount >= 10000000) { // 1 Crore+
      formattedAmount = (amount / 10000000).toFixed(decimals === 0 ? 1 : decimals);
      suffix = 'Cr';
    } else if (absAmount >= 100000) { // 1 Lakh+
      formattedAmount = (amount / 100000).toFixed(decimals === 0 ? 1 : decimals);
      suffix = 'L';
    } else if (absAmount >= 1000) { // 1 Thousand+
      formattedAmount = (amount / 1000).toFixed(decimals === 0 ? 1 : decimals);
      suffix = 'K';
    } else {
      formattedAmount = amount.toFixed(decimals);
    }
    
    // Remove unnecessary decimal zeros
    formattedAmount = parseFloat(formattedAmount).toString();
  } else {
    // Full format with Indian number system
    formattedAmount = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  const result = `${formattedAmount}${suffix}`;
  return showSymbol ? `₹${result}` : result;
}

// Additional utility for different currency formats
export function formatFullCurrency(amount) {
  return formatCurrency(amount, { abbreviated: false, decimals: 2 });
}

export function formatCompactCurrency(amount) {
  return formatCurrency(amount, { abbreviated: true, decimals: 0 });
}

// For display in tables and cards
export function formatDisplayCurrency(amount) {
  return formatCurrency(amount, { abbreviated: true, decimals: 1 });
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).format(new Date(date));
}