import Big from 'big.js';
import dayjs from '@/utils/dayjs';
import { generateUrl } from './common';
import { globalState } from '@/stores';

Big.DP = 40;
Big.PE = 24;

interface FormatNumberOptions {
  rm?: Big.RoundingMode;
  displayMinimum?: boolean;
  maxDigits?: number;
  useUnit?: boolean;
}

export function formatTimestamp(timestamp: string | number | Date, template?: string) {
  if (!dayjs(timestamp).isValid()) return '';
  return dayjs(timestamp).format(template || 'YYYY/MM/DD HH:mm');
}

export function formatDuration(timestamp: number) {
  if (!dayjs(timestamp).isValid()) return '';
  const formattedDuration = dayjs.duration(timestamp);
  const days = Math.floor(formattedDuration.asDays());
  const hours = Math.floor(formattedDuration.asHours() % 24);
  const minutes = formattedDuration.minutes();
  const formattedDays = days ? `${days}d` : '';
  const formattedHours = hours ? `${hours}h` : '';
  const formattedMinutes = minutes ? `${minutes}m` : '';
  if (formattedDays || formattedHours || formattedMinutes)
    return [formattedDays, formattedHours, formattedMinutes].filter(Boolean).join(' ');
  else return '1m';
}

export function formatDurationHumanize(timestamp: number) {
  if (timestamp < 3600000) {
    const minutes = new Big(timestamp / 60000).round(2).toNumber();
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (timestamp < 86400000) {
    const hours = new Big(timestamp / 3600000).round(2).toNumber();
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = new Big(timestamp / 86400000).round(2).toNumber();
    return `${days} day${Number(days) > 1 ? 's' : ''}`;
  }
}

export function formatSortAddress(address: string | undefined) {
  if (!address) return '';

  const domainSuffixes = ['.near', '.testnet', '.betanet', '.mainnet'];
  const maxLength = 12;

  const suffix = domainSuffixes.find((suffix) => address.endsWith(suffix));
  const isLongAddress = address.length > maxLength;

  if (suffix) {
    if (isLongAddress) {
      const visiblePartLength = maxLength - suffix.length - 10;
      if (visiblePartLength > 0) {
        return `${address.slice(0, 6)}...${address.slice(
          -4 - suffix.length,
          -suffix.length,
        )}${suffix}`;
      } else {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      }
    } else {
      return address;
    }
  } else {
    return isLongAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
  }
}

export function formatAmount(amount: string | number | undefined, decimals = 24) {
  if (!amount) return '';
  try {
    const n = new Big(amount).div(Big(10).pow(decimals)).toFixed();
    return n;
  } catch (error) {
    return '';
  }
}

export function parseAmount(amount: string | number | undefined, decimals = 24) {
  if (!amount) return '';
  try {
    return new Big(amount).times(Big(10).pow(decimals)).toFixed(0, Big.roundDown);
  } catch (error) {
    return '';
  }
}

export function formatNumber(val: string | number | undefined, options?: FormatNumberOptions) {
  if (!val || !Number(val)) return '0';
  const { rm = Big.roundHalfUp, displayMinimum, useUnit } = options || {};

  const bigVal = new Big(val);

  // auto calculate the appropriate number of digits, maximum 16 digits
  let maxDigits = options?.maxDigits;
  if (maxDigits === undefined) {
    const absVal = bigVal.abs();
    if (absVal.eq(0)) {
      maxDigits = 0;
    } else if (absVal.gte(1)) {
      // greater than or equal to 1, keep 2 digits
      maxDigits = 2;
    } else {
      // calculate the position of the first non-zero digit
      const str = absVal.toFixed();
      const match = str.match(/^0\.0*/);
      if (match) {
        // for decimals, calculate the number of leading zeros, add 2 valid digits, but not more than 16 digits
        maxDigits = Math.min(match[0].length - 1 + 2, 16);
      } else {
        maxDigits = 2;
      }
    }
  }
  maxDigits = Math.min(maxDigits, 8);

  if (useUnit) {
    if (bigVal.gte(1e9)) {
      return new Big(bigVal.div(1e9)).round(1).toString() + 'B';
    }
    if (bigVal.gte(1e6)) {
      return new Big(bigVal.div(1e6)).round(1).toString() + 'M';
    }
    if (bigVal.gte(1e3)) {
      return new Big(bigVal.div(1e3)).round(1).toString() + 'K';
    }
  }

  const min = new Big(10).pow(-maxDigits);
  const roundedVal = bigVal.round(maxDigits, rm);

  if (displayMinimum && roundedVal.abs().lt(min)) {
    const formattedMin = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: maxDigits,
    }).format(min.toNumber());

    return `< ${roundedVal.lt(0) ? '-' : ''}${formattedMin}`;
  }

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: maxDigits,
  }).format(roundedVal.toNumber());

  return formattedValue;
}

export function formatExplorerUrl(
  val: string,
  type: 'account' | 'transaction' = 'transaction',
  chain = globalState.get('chain'),
) {
  switch (chain) {
    case 'near':
      return (
        (globalState.get('network') === 'mainnet'
          ? 'https://nearblocks.io'
          : 'https://testnet.nearblocks.io') + `/${type === 'account' ? 'address' : 'txns'}/${val}`
      );
    case 'solana':
      return generateUrl(
        `https://explorer.solana.com/${type === 'account' ? 'address' : 'tx'}/${val}`,
        { cluster: globalState.get('network') === 'testnet' ? 'devnet' : 'mainnet-beta' },
      );
  }
}

export function formatFileUrl(key: string) {
  return `https://assets.deltatrade.ai/assets${key}`;
}
