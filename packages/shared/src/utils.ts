import { CURRENCY_DECIMALS } from './constants';

// Format currency amount for display
export function formatAmount(amount: string | number, currency: string): string {
  const decimals = CURRENCY_DECIMALS[currency] ?? 8;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) return '0';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

// Parse amount string to number
export function parseAmount(amount: string): number {
  const cleaned = amount.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Validate crypto address format (basic validation)
export function isValidAddress(address: string, network: string): boolean {
  if (!address || typeof address !== 'string') return false;

  switch (network) {
    case 'BTC':
      // Bitcoin addresses: legacy (1...), P2SH (3...), native SegWit (bc1...)
      return /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);

    case 'LTC':
      // Litecoin addresses: legacy (L/M...), native SegWit (ltc1...)
      return /^(L|M|ltc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);

    case 'TRC20':
      // TRON addresses start with T
      return /^T[a-zA-HJ-NP-Z0-9]{33}$/.test(address);

    case 'ERC20':
      // Ethereum addresses are 0x + 40 hex chars
      return /^0x[a-fA-F0-9]{40}$/.test(address);

    default:
      return false;
  }
}

// Truncate address for display
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// Generate unique ID (for client-side use)
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry utility
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delay?: number; backoff?: number } = {},
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2 } = options;

  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(currentDelay);
        currentDelay *= backoff;
      }
    }
  }

  throw lastError;
}
