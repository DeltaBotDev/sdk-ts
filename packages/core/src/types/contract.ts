export type NetworkId = 'mainnet' | 'testnet';
export type Chain = 'near' | 'solana';

export type TokenMetadata = {
  name?: string;
  symbol: string;
  decimals: number;
  icon: string;
  address: string;
};

export namespace NFT {
  export interface NFTMetadata {
    token_id: string;
    metadata: { media?: string; level: number };
  }
}
