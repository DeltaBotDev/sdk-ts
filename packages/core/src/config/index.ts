import { globalState } from '@/stores';
import { Chain, Token } from '../types/contract';
import { formatFileUrl } from '@/utils/format';

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

export const TOKENS: Record<string, Token.TokenMeta> = {
  NEAR: {
    symbol: 'NEAR',
    decimals: 24,
    SolanaDecimals: 9,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/near.svg'),
    addresses: {
      near: { mainnet: 'wrap.near', testnet: 'wrap.testnet' },
      solana: {
        mainnet: 'BYPsjxa3YuZESQz1dKuBw1QSFCSpecsm8nCQhY5xbU1Z',
      },
    },
  },
  Near: {
    symbol: 'Near',
    decimals: 24,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/near.svg'),
    addresses: {
      near: { mainnet: '', testnet: 'deltanear.testnet' },
    },
  },
  WETH: {
    symbol: 'WETH',
    decimals: 18,
    SolanaDecimals: 8,
    amountDecimals: 5,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/weth.png'),
    addresses: {
      near: {
        mainnet: 'aurora',
        testnet: 'deltaeth.testnet',
      },

      solana: {
        mainnet: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
        testnet: 'GgE6LjokCiAXXVn2rMTwuc7ko76GJ28X8gtgtrNj9mTh',
      },
    },
  },
  ETH: {
    symbol: 'ETH',
    decimals: 18,
    SolanaDecimals: 8,
    amountDecimals: 5,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/eth.svg'),
    addresses: {
      near: {
        mainnet: 'aurora',
        testnet: 'deltaeth.testnet',
      },

      solana: {
        mainnet: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
        testnet: 'GgE6LjokCiAXXVn2rMTwuc7ko76GJ28X8gtgtrNj9mTh',
      },
    },
  },
  ['USDT.e']: {
    symbol: 'USDT.e',
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/usdt.e.svg'),
    addresses: {
      near: {
        mainnet: 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
        testnet: 'usdt.fakes.testnet',
      },
    },
  },
  USDt: {
    symbol: 'USDt',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/usdt.svg'),
    addresses: {
      near: { mainnet: 'usdt.tether-token.near', testnet: 'usdtt.fakes.testnet' },

      solana: { mainnet: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', testnet: '' },
    },
  },
  ['USDC.e']: {
    symbol: 'USDC.e',
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/usdc.e.svg'),
    addresses: {
      near: {
        mainnet: 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        testnet: 'deltausdc.testnet',
      },
    },
  },
  USDC: {
    symbol: 'USDC',
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/usdc.svg'),
    addresses: {
      near: {
        mainnet: '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        testnet: 'deltausdc.testnet',
      },

      solana: {
        mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        testnet: '4daMLQAi8PhHQizRXyJPdvURJ6yYMYfBXFDT4LAMJG1L',
      },
    },
  },
  WBTC: {
    symbol: 'WBTC',
    decimals: 8,
    SolanaDecimals: 8,
    amountDecimals: 6,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/wbtc.svg'),
    addresses: {
      near: {
        mainnet: '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near',
        testnet: 'deltabtc.testnet',
      },

      solana: { mainnet: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', testnet: '' },
    },
  },
  REF: {
    symbol: 'REF',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/ref.svg'),
    addresses: {
      near: { mainnet: 'token.v2.ref-finance.near', testnet: 'ref.fakes.testnet' },
    },
  },
  BRRR: {
    symbol: 'BRRR',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl('/crypto/BURROW.png'),
    addresses: {
      near: { mainnet: 'token.burrow.near', testnet: '' },
    },
  },
  LONK: {
    symbol: 'LONK',
    decimals: 8,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl('/crypto/LONK.png'),
    addresses: {
      near: { mainnet: 'token.lonkingnearbackto2024.near', testnet: 'deltalonk.testnet' },
    },
  },
  DGS: {
    symbol: 'DGS',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl('/crypto/DGS.svg'),
    addresses: {
      near: { mainnet: 'dragonsoultoken.near', testnet: 'dragonsoultoken.testnet' },
    },
  },
  BLACKDRAGON: {
    symbol: 'BLACKDRAGON',
    decimals: 24,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl('/crypto/blackdragon.jpeg'),
    addresses: {
      near: { mainnet: 'blackdragon.tkn.near', testnet: '' },
    },
  },
  SHITZU: {
    symbol: 'SHITZU',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl('/crypto/SHITZU.webp'),
    addresses: {
      near: { mainnet: 'token.0xshitzu.near', testnet: '' },
    },
  },
  NEKO: {
    symbol: 'NEKO',
    decimals: 24,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl('/crypto/NEKO.svg'),
    addresses: {
      near: { mainnet: 'ftv2.nekotoken.near', testnet: '' },
    },
  },
  NEARVIDIA: {
    symbol: 'NEARVIDIA',
    decimals: 8,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl('/crypto/NEARVIDIA.png'),
    addresses: {
      near: { mainnet: 'nearnvidia.near', testnet: '' },
    },
  },
  GEAR: {
    symbol: 'GEAR',
    decimals: 18,
    amountDecimals: 4,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/GEAR.png'),
    addresses: {
      near: { mainnet: 'gear.enleap.near', testnet: '' },
    },
  },
  BEAN: {
    symbol: 'BEAN',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl('/crypto/BEAN.jpeg'),
    addresses: {
      near: { mainnet: 'bean.tkn.near', testnet: '' },
    },
  },
  SLUSH: {
    symbol: 'SLUSH',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl('/crypto/SLUSH.jpeg'),
    addresses: {
      near: { mainnet: 'slush.tkn.near', testnet: '' },
    },
  },
  marmaj: {
    symbol: 'marmaj',
    decimals: 18,
    amountDecimals: 4,
    priceDecimals: 6,
    icon: formatFileUrl('/crypto/marmaj.png'),
    addresses: {
      near: { mainnet: 'marmaj.tkn.near', testnet: '' },
    },
  },
  FAST: {
    symbol: 'FAST',
    decimals: 24,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/FAST.png'),
    addresses: {
      near: { mainnet: 'edge-fast.near', testnet: '' },
    },
  },
  HAT: {
    symbol: 'HAT',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl('/crypto/HAT.jpeg'),
    addresses: {
      near: { mainnet: 'hat.tkn.near', testnet: '' },
    },
  },
  LNR: {
    symbol: 'LNR',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/LNR.png'),
    addresses: {
      near: {
        mainnet: '802d89b6e511b335f05024a65161bce7efc3f311.factory.bridge.near',
        testnet: '',
      },
    },
  },
  CHILL: {
    symbol: 'CHILL',
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl('/crypto/CHILL.png'),
    addresses: {
      near: { mainnet: 'chill-129.meme-cooking.near', testnet: '' },
    },
  },
  mpDAO: {
    symbol: 'mpDAO',
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/mpDAO.svg'),
    addresses: {
      near: { mainnet: 'mpdao-token.near', testnet: '' },
    },
  },
  SOL: {
    symbol: 'SOL',
    decimals: 9,
    SolanaDecimals: 9,
    amountDecimals: 4,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/SOL.svg'),
    addresses: {
      near: { mainnet: '22.contract.portalbridge.near' },
      solana: {
        mainnet: 'So11111111111111111111111111111111111111112',
        testnet: 'So11111111111111111111111111111111111111112',
      },
    },
  },
  JUP: {
    symbol: 'JUP',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/jup.png'),
    addresses: {
      solana: { mainnet: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
    },
  },
  RAY: {
    symbol: 'RAY',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/ray.png'),
    addresses: {
      solana: { mainnet: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
    },
  },
  Bonk: {
    symbol: 'Bonk',
    decimals: 5,
    SolanaDecimals: 5,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl('/crypto/bonk.jpg'),
    addresses: {
      solana: { mainnet: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
    },
  },
  Moutai: {
    symbol: 'Moutai',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl('/crypto/moutai.jpg'),
    addresses: {
      solana: { mainnet: '45EgCwcPXYagBC7KqBin4nCFgEZWN7f3Y6nACwxqMCWX' },
    },
  },
  $WIF: {
    symbol: '$WIF',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/$wif.jpg'),
    addresses: {
      solana: { mainnet: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
    },
  },
  mSOL: {
    symbol: 'mSOL',
    decimals: 9,
    SolanaDecimals: 9,
    amountDecimals: 4,
    priceDecimals: 2,
    icon: formatFileUrl('/crypto/msol.png'),
    addresses: {
      solana: { mainnet: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So' },
    },
  },
  ORCA: {
    symbol: 'ORCA',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl('/crypto/orca.png'),
    addresses: {
      solana: { mainnet: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE' },
    },
  },
  KMNO: {
    symbol: 'KMNO',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl('/crypto/kmno.svg'),
    addresses: {
      solana: { mainnet: 'KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS' },
    },
  },
  CIGGS: {
    symbol: 'CIGGS',
    decimals: 9,
    SolanaDecimals: 9,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl('/crypto/ciggs.png'),
    addresses: {
      solana: { mainnet: '7p6RjGNZ7HLHpfTo6nh21XYw4CZgxXLQPzKXG72pNd2y' },
    },
  },
  BUTT: {
    symbol: 'BUTT',
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl('/crypto/butt.jpeg'),
    addresses: {
      solana: { mainnet: '3dCCbYca3jSgRdDiMEeV5e3YKNzsZAp3ZVfzUsbb4be4' },
    },
  },
};

export const ExternalUrls = {
  docs: 'https://docs.deltatrade.ai/',
  twitter: 'https://twitter.com/DeltaBotTeam',
  telegram: 'https://t.me/deltabotchat',
};
