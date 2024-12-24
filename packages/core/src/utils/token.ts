import { TOKENS } from '@/config';
import { globalState } from '@/stores';
import { Chain, Token } from '../types/contract';
import { NetworkId } from '@near-wallet-selector/core';

export function getTokenMeta(symbol: string) {
  return TOKENS[symbol];
}

export function getTokenAddress(symbol: string, chain?: Chain, network?: NetworkId) {
  const _chain = chain || globalState.get('chain');
  const _network = network || globalState.get('network');
  return TOKENS[symbol]?.addresses?.[_chain]?.[_network];
}

export function getTokenByAddress(address: string, chain?: Chain, network?: NetworkId) {
  if (!address) return;
  const _chain = chain || globalState.get('chain');
  const _network = network || globalState.get('network');
  const res = Object.values(TOKENS).find(
    (token) => token.addresses?.[_chain]?.[_network] === address,
  );
  const decimals = getTokenDecimals(res?.symbol!, chain);
  return { ...res, decimals } as Token.TokenMeta;
}

export function getTokenDecimals(symbol: string, chain?: Chain) {
  const _chain = chain || globalState.get('chain');
  const decimalsKey = _chain === 'solana' ? 'SolanaDecimals' : 'decimals';
  return TOKENS[symbol]?.[decimalsKey] || TOKENS[symbol]?.decimals;
}
