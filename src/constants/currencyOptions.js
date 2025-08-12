// Centralized currency input options for vue-currency-input (v3)
// Egyptian Pound (EGP), 2 decimals, min/max aligned with DB limits

export const currencyOptions = {
  currency: 'EGP',
  locale: 'en-EG',
  precision: 2,
  valueRange: { min: 0, max: 9999999999.99 },
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false
  // Optional: enable if you want typing "1234" to become "12.34"
  // autoDecimalDigits: true
}


