export type NetworkId = 'mainnet' | 'testnet';
export type Chain = 'near' | 'solana';

export type TokenMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
};

export namespace Token {
  export interface TokenMeta {
    symbol: string;
    decimals: number;
    SolanaDecimals?: number;
    amountDecimals?: number;
    icon: string;
    addresses?: Partial<Record<Chain, Partial<Record<NetworkId, string>>>>;
    priceDecimals?: number;
  }
}

export namespace NFT {
  export interface NFTMetadata {
    token_id: string;
    metadata: { media?: string; level: number };
  }
}
