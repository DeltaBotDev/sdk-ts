import { Chain } from '../types/contract';
import { NetworkId } from '@near-wallet-selector/core';

const NEAR_RPC_NODE_URLS: Record<string, Record<string, string>> = {
  mainnet: {
    Lava: 'https://near.lava.build',
    Official: 'https://rpc.mainnet.near.org',
    Fastnear: 'https://free.rpc.fastnear.com',
    Drpc: 'https://near.drpc.org',
  },
  testnet: {
    Lava: 'https://near-testnet.lava.build',
    Official: 'https://rpc.testnet.near.org',
    Drpc: 'https://near-testnet.drpc.org',
  },
};

const SOLANA_RPC_NODE_URLS: Record<string, Record<string, string>> = {
  mainnet: {
    Delta: 'https://solana.deltarpc.com/',
    XNFT: 'https://swr.xnftdata.com/rpc-proxy/',
    // Chainstack: 'https://solana-mainnet.core.chainstack.com/ed9e4c2d2237fa74cb0a4d61fa07cf79',
  },
  testnet: {
    Official: 'https://api.devnet.solana.com',
  },
};

export function getRPCNodeUrls(chain: Chain, network: NetworkId) {
  return chain === 'near' ? NEAR_RPC_NODE_URLS[network] : SOLANA_RPC_NODE_URLS[network];
}
