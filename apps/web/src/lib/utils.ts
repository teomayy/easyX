import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(amount: string | number, decimals: number = 8): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';

  // Remove trailing zeros
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

export function formatCurrency(amount: string | number, currency: string): string {
  const formatted = formatAmount(amount);
  return `${formatted} ${currency}`;
}

export function truncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
