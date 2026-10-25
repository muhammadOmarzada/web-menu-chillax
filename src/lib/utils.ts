export { cn } from "cn"

/**
 * Format number into Indonesian Rupiah (IDR) currency format.
 * Example: 25000 -> "Rp 25.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number into compact 'K' representation for web menu badges.
 * Example: 13000 -> "13K", 15500 -> "15.5K", 8000 -> "8K"
 */
export function formatPriceK(amount: number): string {
  if (amount >= 1000) {
    const kValue = amount / 1000
    return `${Number.isInteger(kValue) ? kValue : kValue.toFixed(1)}K`
  }
  return amount.toString()
}
