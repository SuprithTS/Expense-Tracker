export const getCurrencySymbol = (currency) => {
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  
  return currencySymbols[currency] || currency;
};

export const formatCurrency = (amount, currency) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};