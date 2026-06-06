// src/utils/currency.js
export async function convertToPHP(amount, currencyCode) {
  if (currencyCode === 'PHP') return amount;
  
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currencyCode}`);
    const data = await response.json();
    return amount * data.rates.PHP;
  } catch (error) {
    console.error("Offline or fetch failed:", error);
    return amount; // Fallback to raw amount if offline
  }
}
