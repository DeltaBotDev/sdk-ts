import { globalState } from '@/stores';
import { Chain } from '../types/contract';

export const CHAINS: Chain[] = ['near', 'solana'];
export const CHAIN_NAMES: Record<Chain, string> = {
  near: 'Near',
  solana: 'Solana',
};

export const CONFIG_MAP = {
  mainnet: {
    nearGridContract: 'grid.deltatrade.near',
    nearDCAContract: 'dca.deltatrade.near',
    nearGachaponContract: 'deltagachapon.near',
    apiHost: 'https://api.deltatrade.ai',

    solanaGridContract: 'CNLGhYQgNwjyDfHZTEjHfk1MPkqwP96qZahWN82UfcLM',
    solanaGridBotState: 'FRcbUFpGHQppvXAyJrNYLKME1BQfowh4xKZB2vt9j6yn',
    solanaApiHost: 'https://solapi.deltatrade.ai',

    indexerHost: 'https://indexer.ref.finance',
    nearBlocksApiHost: 'https://api.nearblocks.io',
  },
  testnet: {
    nearGridContract: 'deltabotsdev.testnet',
    nearDCAContract: 'deltadca.testnet',
    nearGachaponContract: 'gachapons.testnet',
    apiHost: 'https://api-dev.delta.bot',

    solanaGridContract: 'CNLGhYQgNwjyDfHZTEjHfk1MPkqwP96qZahWN82UfcLM',
    solanaGridBotState: '5o5q6XjaZJRyrsnXcfPnD5ninRnwmDiD4kC1bAFqVY1t',
    solanaApiHost: 'https://sol.api.dev.delta.bot',

    indexerHost: 'https://indexer.ref.finance',
    nearBlocksApiHost: 'https://api-testnet.nearblocks.io',
  },
};

export function getConfigs(network = globalState.get('network')) {
  return CONFIG_MAP[network];
}

export const ExternalUrls = {
  docs: 'https://docs.deltatrade.ai/',
  twitter: 'https://twitter.com/DeltaBotTeam',
  telegram: 'https://t.me/deltabotchat',
};
