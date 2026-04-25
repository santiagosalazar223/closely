export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M USD`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K USD`;
  }
  return `$${amount.toLocaleString()} USD`;
}

export function getPaybackPeriod(askingPrice: number, annualProfit: number): string {
  if (annualProfit <= 0) return "Requiere estrategia para rentabilidad";
  const years = askingPrice / annualProfit;
  
  if (years < 1) {
    const months = Math.round(years * 12);
    return `Recuperas tu inversión en ~${months} meses`;
  }
  
  return `Recuperas tu inversión en ~${years.toFixed(1)} años`;
}

export function getMonthlyFreeCash(annualProfit: number): string {
  if (annualProfit <= 0) return "En punto de equilibrio / Pérdida";
  const monthly = annualProfit / 12;
  return `Deja ${formatCurrency(monthly)} libres al mes`;
}

export function getGrowthDescription(growthPercentage: number): string {
  if (growthPercentage > 50) return "Crecimiento explosivo 🚀";
  if (growthPercentage > 20) return "Alto crecimiento 📈";
  if (growthPercentage > 0) return "Crecimiento estable 👍";
  return "Negocio maduro";
}
