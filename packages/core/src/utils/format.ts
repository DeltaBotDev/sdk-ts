import Big from 'big.js';
import dayjs from '@/utils/dayjs';
import { TOKENS } from '@/config';
import { generateUrl } from './common';
import { globalState } from '@/stores';

Big.DP = 40;
Big.PE = 24;

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

export function formatNumber(val: string | number | undefined, options?: Intl.NumberFormatOptions) {
  if (val === undefined) return '';
  return new Intl.NumberFormat('en-US', options).format(Number(val));
}

export function parseDisplayAmount(
  val: string | number | undefined,
  symbol: string,
  options?: { rm?: Big.RoundingMode },
) {
  const result = formatNumberBySymbol(val, symbol, { rm: options?.rm, displayMinimum: false });
  if (!result) return '0';
  return result.replace(/^[^-0-9.]+|[^-0-9.]/g, '');
}
export function parseDisplayPrice(
  val: string | number | undefined,
  symbol: string,
  options?: { rm?: Big.RoundingMode },
) {
  const result = formatUSDPrice(val, { symbol, showSign: false, rm: options?.rm });
  if (!result) return '0';
  return result.replace(/^[^-0-9.]+|[^-0-9.]/g, '');
}

export function formatNumberBySymbol(
  val: string | number | undefined,
  symbol: string,
  options?: {
    rm?: Big.RoundingMode;
    displayMinimum?: boolean;
  },
) {
  if (!val || !Number(val)) return '0';

  const tokenConfig = TOKENS[symbol] || {};
  const decimals = tokenConfig.amountDecimals ?? 2;
  const min = new Big(10).pow(-decimals);
  const bigVal = new Big(val);
  const { rm = Big.roundHalfUp, displayMinimum = true } = options || {};
  const roundedVal = bigVal.round(decimals, rm);

  if (displayMinimum && roundedVal.abs().lt(min)) {
    const formattedMin = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: decimals,
    }).format(min.toNumber());

    return `< ${roundedVal.lt(0) ? '-' : ''}${formattedMin}`;
  }

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: decimals,
  }).format(roundedVal.toNumber());

  return formattedValue;
}

export function formatUSDPrice(
  val: string | number | undefined,
  options?: {
    symbol?: string;
    showSign?: boolean;
    decimals?: number;
    rm?: Big.RoundingMode;
  } & Intl.NumberFormatOptions,
) {
  const sign = options?.showSign ? '$' : '';
  if (!val || !Number(val)) return sign + '0';

  const decimals =
    options?.decimals ??
    (new Big(val).abs().lt(1) ? (options?.symbol ? TOKENS[options.symbol]?.priceDecimals : 2) : 2);
  const min = new Big(10).pow(-(decimals ?? 2));
  const bigVal = new Big(val);
  if (bigVal.abs().lt(min)) return `< ${bigVal.lt(0) ? '-' : ''}${sign}${min}`;
  return new Intl.NumberFormat('en-US', {
    style: options?.showSign ? 'currency' : 'decimal',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    ...options,
  }).format(bigVal.round(decimals, options?.rm ?? Big.roundHalfUp).toNumber());
}

export function formatPercent(
  val: string | number | undefined,
  options?: {
    precision?: number;
    showPlus?: boolean;
    decimals?: number;
    rm?: Big.RoundingMode;
    displayMinimum?: boolean;
  },
) {
  const _val = isNaN(Number(val)) ? 0 : Number(val);
  const symbol = options?.showPlus && _val > 0 ? '+' : '';
  const value = new Big(_val)
    .times(10 ** (options?.decimals || 0))
    .round(options?.precision ?? 2, options?.rm);
  if (options?.displayMinimum && value.abs().gt(0) && value.abs().lt(1)) {
    return `< ${value.lt(0) ? '-' : ''}1%`;
  }
  return symbol + value.toString() + '%';
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
