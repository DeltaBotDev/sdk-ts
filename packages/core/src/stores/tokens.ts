import { globalState } from './index';
import { Chain, NetworkId, TokenMetadata } from '@/types/contract';
import { pairServices } from '@/services/token';

type TokensCache = Record<Chain, Record<string, TokenMetadata>>;

const TOKENS_CACHE_KEY = 'tokens';

// Main token store - organized by chain and address
const tokensByChain: Record<Chain, Record<string, TokenMetadata>> = {
  near: {},
  solana: {},
};

// Try to load tokens from cache on module initialization
loadTokensFromCache();

/**
 * Load tokens from storage cache
 */
function loadTokensFromCache(): void {
  const cached = globalState.loadFromStorage<TokensCache>(TOKENS_CACHE_KEY);
  if (cached) {
    // Copy cached data to tokensByChain
    Object.assign(tokensByChain, cached);
  }
}

/**
 * Save tokens to storage cache
 */
function saveTokensToCache(): void {
  globalState.saveToStorage(TOKENS_CACHE_KEY, tokensByChain);
}

/**
 * Get symbol to address mapping for a specific chain
 * Generated on-demand rather than stored
 */
function getSymbolMapping(chain: Chain): Record<string, string> {
  const symbolMap: Record<string, string> = {};

  Object.entries(tokensByChain[chain] || {}).forEach(([address, token]) => {
    if (token.symbol) {
      symbolMap[token.symbol] = address;
    }
  });

  return symbolMap;
}

/**
 * Update tokens data from pairs API
 * This is a separate function that updates the tokens without blocking
 */
async function updateTokensFromAPI(): Promise<void> {
  try {
    const chain = globalState.get('chain') as Chain;
    const pairs = await pairServices.query(chain);

    if (pairs && pairs.length > 0) {
      pairs.forEach((pair) => {
        if (pair.base_token) {
          const { symbol, code, decimals, icon } = pair.base_token;
          if (code) {
            const token: TokenMetadata = {
              symbol,
              decimals,
              icon: icon || '',
              address: code,
            };

            // Add to tokensByChain
            tokensByChain[chain][code] = token;
          }
        }

        if (pair.quote_token) {
          const { symbol, code, decimals, icon } = pair.quote_token;
          if (code) {
            const token: TokenMetadata = {
              symbol,
              decimals,
              icon: icon || '',
              address: code,
            };

            // Add to tokensByChain
            tokensByChain[chain][code] = token;
          }
        }
      });

      saveTokensToCache();
    }
  } catch (error) {
    console.error('Failed to update tokens from API:', error);
  }
}

/**
 * Initialize tokens data
 * First load from cache (if available), then update from API in background
 */
export async function initTokens(): Promise<void> {
  const chain = globalState.get('chain') as Chain;
  const hasCachedData = Object.keys(tokensByChain[chain] || {}).length > 0;
  if (hasCachedData) {
    // If we have cached data, use it and update in the background
    updateTokensFromAPI().catch((err) => {
      console.error('Background token update failed:', err);
    });
    return Promise.resolve();
  } else {
    // No cached data, we need to wait for the API
    try {
      await updateTokensFromAPI();
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize tokens:', error);
      return Promise.reject(error);
    }
  }
}

/**
 * Get token by symbol and chain
 */
export function getTokenBySymbol(symbol: string, chain?: Chain): TokenMetadata | undefined {
  const _chain = chain || (globalState.get('chain') as Chain);
  const symbolMap = getSymbolMapping(_chain);
  const address = symbolMap[symbol];

  if (address) {
    return tokensByChain[_chain]?.[address];
  }

  return undefined;
}

/**
 * Get token by address and chain
 */
export function getTokenByAddress(address: string, chain?: Chain): TokenMetadata | undefined {
  const _chain = chain || (globalState.get('chain') as Chain);
  return tokensByChain[_chain]?.[address];
}

/**
 * Get all tokens for a specific chain
 */
export function getTokensByChain(chain?: Chain): TokenMetadata[] {
  const _chain = chain || (globalState.get('chain') as Chain);
  return Object.values(tokensByChain[_chain] || {});
}

/**
 * Get all tokens mapped by symbol for a specific chain
 */
export function getTokensBySymbol(chain?: Chain): Record<string, TokenMetadata> {
  const _chain = chain || (globalState.get('chain') as Chain);
  const result: Record<string, TokenMetadata> = {};

  Object.values(tokensByChain[_chain] || {}).forEach((token) => {
    if (token.symbol) {
      result[token.symbol] = token;
    }
  });

  return result;
}

/**
 * Add or update a token
 */
export function updateToken(token: TokenMetadata, chain?: Chain): void {
  const _chain = chain || (globalState.get('chain') as Chain);
  tokensByChain[_chain][token.address] = token;
  saveTokensToCache();
}

/**
 * Get token address for a symbol
 */
export function getTokenAddress(symbol: string, chain?: Chain): string | undefined {
  const _chain = chain || (globalState.get('chain') as Chain);

  const token = getTokenBySymbol(symbol, _chain);
  return token?.address;
}
