"use client";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/stores/index.ts
var _GlobalState = class _GlobalState {
  constructor() {
    __publicField(this, "state", {
      chain: "near",
      network: "mainnet"
    });
  }
  static getInstance() {
    if (!_GlobalState.instance) {
      _GlobalState.instance = new _GlobalState();
    }
    return _GlobalState.instance;
  }
  set(key, value) {
    this.state[key] = value;
  }
  get(key) {
    return this.state[key];
  }
  remove(key) {
    delete this.state[key];
  }
};
__publicField(_GlobalState, "instance");
var GlobalState = _GlobalState;
var globalState = GlobalState.getInstance();

// src/utils/format.ts
import Big from "big.js";

// src/utils/dayjs.ts
import dayjs from "dayjs";
import "dayjs/locale/en";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.locale("en");
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
var dayjs_default = dayjs;

// src/utils/common.ts
function generateUrl(url = "", query, hashes = {}) {
  const queryStringParts = [];
  for (const key in query) {
    const value = query[key];
    if ([void 0, null, ""].includes(value)) continue;
    if (Array.isArray(value)) {
      value.forEach((_value) => {
        queryStringParts.push(encodeURIComponent(key) + "[]=" + encodeURIComponent(_value));
      });
    } else {
      queryStringParts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
  }
  const queryString = queryStringParts.join("&");
  if (queryString) {
    url += url.includes("?") ? "&" : "?";
    url += queryString;
  }
  const hashStringParts = [];
  for (const key in hashes) {
    const value = hashes[key];
    if ([void 0, null, ""].includes(value)) continue;
    hashStringParts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
  }
  const hashString = hashStringParts.join("&");
  if (hashString) {
    url += "#" + hashString;
  }
  return url;
}

// src/utils/format.ts
Big.DP = 40;
Big.PE = 24;
function formatDurationHumanize(timestamp) {
  if (timestamp < 36e5) {
    const minutes = new Big(timestamp / 6e4).round(2).toNumber();
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (timestamp < 864e5) {
    const hours = new Big(timestamp / 36e5).round(2).toNumber();
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    const days = new Big(timestamp / 864e5).round(2).toNumber();
    return `${days} day${Number(days) > 1 ? "s" : ""}`;
  }
}
function formatAmount(amount, decimals = 24) {
  if (!amount) return "";
  try {
    const n = new Big(amount).div(Big(10).pow(decimals)).toFixed();
    return n;
  } catch (error) {
    return "";
  }
}
function parseAmount(amount, decimals = 24) {
  if (!amount) return "";
  try {
    return new Big(amount).times(Big(10).pow(decimals)).toFixed(0, Big.roundDown);
  } catch (error) {
    return "";
  }
}
function formatNumber(val, options) {
  if (val === void 0) return "";
  return new Intl.NumberFormat("en-US", options).format(Number(val));
}
function parseDisplayAmount(val, symbol, options) {
  const result = formatNumberBySymbol(val, symbol, { rm: options == null ? void 0 : options.rm, displayMinimum: false });
  if (!result) return "0";
  return result.replace(/^[^-0-9.]+|[^-0-9.]/g, "");
}
function parseDisplayPrice(val, symbol, options) {
  const result = formatUSDPrice(val, { symbol, showSign: false, rm: options == null ? void 0 : options.rm });
  if (!result) return "0";
  return result.replace(/^[^-0-9.]+|[^-0-9.]/g, "");
}
function formatNumberBySymbol(val, symbol, options) {
  var _a;
  if (!val || !Number(val)) return "0";
  const tokenConfig = TOKENS[symbol] || {};
  const decimals = (_a = tokenConfig.amountDecimals) != null ? _a : 2;
  const min = new Big(10).pow(-decimals);
  const bigVal = new Big(val);
  const { rm = Big.roundHalfUp, displayMinimum = true } = options || {};
  const roundedVal = bigVal.round(decimals, rm);
  if (displayMinimum && roundedVal.abs().lt(min)) {
    const formattedMin = new Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: decimals
    }).format(min.toNumber());
    return `< ${roundedVal.lt(0) ? "-" : ""}${formattedMin}`;
  }
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "decimal",
    maximumFractionDigits: decimals
  }).format(roundedVal.toNumber());
  return formattedValue;
}
function formatUSDPrice(val, options) {
  var _a, _b, _c;
  const sign = (options == null ? void 0 : options.showSign) ? "$" : "";
  if (!val || !Number(val)) return sign + "0";
  const decimals = (_b = options == null ? void 0 : options.decimals) != null ? _b : new Big(val).abs().lt(1) ? (options == null ? void 0 : options.symbol) ? (_a = TOKENS[options.symbol]) == null ? void 0 : _a.priceDecimals : 2 : 2;
  const min = new Big(10).pow(-(decimals != null ? decimals : 2));
  const bigVal = new Big(val);
  if (bigVal.abs().lt(min)) return `< ${bigVal.lt(0) ? "-" : ""}${sign}${min}`;
  return new Intl.NumberFormat("en-US", __spreadValues({
    style: (options == null ? void 0 : options.showSign) ? "currency" : "decimal",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }, options)).format(bigVal.round(decimals, (_c = options == null ? void 0 : options.rm) != null ? _c : Big.roundHalfUp).toNumber());
}
function formatFileUrl(key) {
  return `https://assets.deltatrade.ai/assets${key}`;
}

// src/config/index.ts
var CHAINS = ["near", "solana"];
var CONFIG_MAP = {
  mainnet: {
    nearGridContract: "grid.deltatrade.near",
    nearDCAContract: "dca.deltatrade.near",
    nearGachaponContract: "deltagachapon.near",
    apiHost: "https://api.deltatrade.ai",
    solanaGridContract: "CNLGhYQgNwjyDfHZTEjHfk1MPkqwP96qZahWN82UfcLM",
    solanaGridBotState: "FRcbUFpGHQppvXAyJrNYLKME1BQfowh4xKZB2vt9j6yn",
    solanaApiHost: "https://solapi.deltatrade.ai",
    indexerHost: "https://indexer.ref.finance",
    nearBlocksApiHost: "https://api.nearblocks.io"
  },
  testnet: {
    nearGridContract: "deltabotsdev.testnet",
    nearDCAContract: "deltadca.testnet",
    nearGachaponContract: "gachapons.testnet",
    apiHost: "https://api-dev.delta.bot",
    solanaGridContract: "CNLGhYQgNwjyDfHZTEjHfk1MPkqwP96qZahWN82UfcLM",
    solanaGridBotState: "5o5q6XjaZJRyrsnXcfPnD5ninRnwmDiD4kC1bAFqVY1t",
    solanaApiHost: "https://sol.api.dev.delta.bot",
    indexerHost: "https://indexer.ref.finance",
    nearBlocksApiHost: "https://api-testnet.nearblocks.io"
  }
};
function getConfigs(network = globalState.get("network")) {
  return CONFIG_MAP[network];
}
var TOKENS = {
  NEAR: {
    symbol: "NEAR",
    decimals: 24,
    SolanaDecimals: 9,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/near.svg"),
    addresses: {
      near: { mainnet: "wrap.near", testnet: "wrap.testnet" },
      solana: {
        mainnet: "BYPsjxa3YuZESQz1dKuBw1QSFCSpecsm8nCQhY5xbU1Z"
      }
    }
  },
  Near: {
    symbol: "Near",
    decimals: 24,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/near.svg"),
    addresses: {
      near: { mainnet: "", testnet: "deltanear.testnet" }
    }
  },
  WETH: {
    symbol: "WETH",
    decimals: 18,
    SolanaDecimals: 8,
    amountDecimals: 5,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/weth.png"),
    addresses: {
      near: {
        mainnet: "aurora",
        testnet: "deltaeth.testnet"
      },
      solana: {
        mainnet: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
        testnet: "GgE6LjokCiAXXVn2rMTwuc7ko76GJ28X8gtgtrNj9mTh"
      }
    }
  },
  ETH: {
    symbol: "ETH",
    decimals: 18,
    SolanaDecimals: 8,
    amountDecimals: 5,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/eth.svg"),
    addresses: {
      near: {
        mainnet: "aurora",
        testnet: "deltaeth.testnet"
      },
      solana: {
        mainnet: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
        testnet: "GgE6LjokCiAXXVn2rMTwuc7ko76GJ28X8gtgtrNj9mTh"
      }
    }
  },
  ["USDT.e"]: {
    symbol: "USDT.e",
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/usdt.e.svg"),
    addresses: {
      near: {
        mainnet: "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        testnet: "usdt.fakes.testnet"
      }
    }
  },
  USDt: {
    symbol: "USDt",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/usdt.svg"),
    addresses: {
      near: { mainnet: "usdt.tether-token.near", testnet: "usdtt.fakes.testnet" },
      solana: { mainnet: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", testnet: "" }
    }
  },
  ["USDC.e"]: {
    symbol: "USDC.e",
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/usdc.e.svg"),
    addresses: {
      near: {
        mainnet: "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        testnet: "deltausdc.testnet"
      }
    }
  },
  USDC: {
    symbol: "USDC",
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/usdc.svg"),
    addresses: {
      near: {
        mainnet: "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        testnet: "deltausdc.testnet"
      },
      solana: {
        mainnet: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        testnet: "4daMLQAi8PhHQizRXyJPdvURJ6yYMYfBXFDT4LAMJG1L"
      }
    }
  },
  WBTC: {
    symbol: "WBTC",
    decimals: 8,
    SolanaDecimals: 8,
    amountDecimals: 6,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/wbtc.svg"),
    addresses: {
      near: {
        mainnet: "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near",
        testnet: "deltabtc.testnet"
      },
      solana: { mainnet: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", testnet: "" }
    }
  },
  REF: {
    symbol: "REF",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/ref.svg"),
    addresses: {
      near: { mainnet: "token.v2.ref-finance.near", testnet: "ref.fakes.testnet" }
    }
  },
  BRRR: {
    symbol: "BRRR",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl("/crypto/BURROW.png"),
    addresses: {
      near: { mainnet: "token.burrow.near", testnet: "" }
    }
  },
  LONK: {
    symbol: "LONK",
    decimals: 8,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl("/crypto/LONK.png"),
    addresses: {
      near: { mainnet: "token.lonkingnearbackto2024.near", testnet: "deltalonk.testnet" }
    }
  },
  DGS: {
    symbol: "DGS",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl("/crypto/DGS.svg"),
    addresses: {
      near: { mainnet: "dragonsoultoken.near", testnet: "dragonsoultoken.testnet" }
    }
  },
  BLACKDRAGON: {
    symbol: "BLACKDRAGON",
    decimals: 24,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl("/crypto/blackdragon.jpeg"),
    addresses: {
      near: { mainnet: "blackdragon.tkn.near", testnet: "" }
    }
  },
  SHITZU: {
    symbol: "SHITZU",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl("/crypto/SHITZU.webp"),
    addresses: {
      near: { mainnet: "token.0xshitzu.near", testnet: "" }
    }
  },
  NEKO: {
    symbol: "NEKO",
    decimals: 24,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl("/crypto/NEKO.svg"),
    addresses: {
      near: { mainnet: "ftv2.nekotoken.near", testnet: "" }
    }
  },
  NEARVIDIA: {
    symbol: "NEARVIDIA",
    decimals: 8,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl("/crypto/NEARVIDIA.png"),
    addresses: {
      near: { mainnet: "nearnvidia.near", testnet: "" }
    }
  },
  GEAR: {
    symbol: "GEAR",
    decimals: 18,
    amountDecimals: 4,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/GEAR.png"),
    addresses: {
      near: { mainnet: "gear.enleap.near", testnet: "" }
    }
  },
  BEAN: {
    symbol: "BEAN",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl("/crypto/BEAN.jpeg"),
    addresses: {
      near: { mainnet: "bean.tkn.near", testnet: "" }
    }
  },
  SLUSH: {
    symbol: "SLUSH",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 12,
    icon: formatFileUrl("/crypto/SLUSH.jpeg"),
    addresses: {
      near: { mainnet: "slush.tkn.near", testnet: "" }
    }
  },
  marmaj: {
    symbol: "marmaj",
    decimals: 18,
    amountDecimals: 4,
    priceDecimals: 6,
    icon: formatFileUrl("/crypto/marmaj.png"),
    addresses: {
      near: { mainnet: "marmaj.tkn.near", testnet: "" }
    }
  },
  FAST: {
    symbol: "FAST",
    decimals: 24,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/FAST.png"),
    addresses: {
      near: { mainnet: "edge-fast.near", testnet: "" }
    }
  },
  HAT: {
    symbol: "HAT",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl("/crypto/HAT.jpeg"),
    addresses: {
      near: { mainnet: "hat.tkn.near", testnet: "" }
    }
  },
  LNR: {
    symbol: "LNR",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/LNR.png"),
    addresses: {
      near: {
        mainnet: "802d89b6e511b335f05024a65161bce7efc3f311.factory.bridge.near",
        testnet: ""
      }
    }
  },
  CHILL: {
    symbol: "CHILL",
    decimals: 18,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl("/crypto/CHILL.png"),
    addresses: {
      near: { mainnet: "chill-129.meme-cooking.near", testnet: "" }
    }
  },
  mpDAO: {
    symbol: "mpDAO",
    decimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/mpDAO.svg"),
    addresses: {
      near: { mainnet: "mpdao-token.near", testnet: "" }
    }
  },
  SOL: {
    symbol: "SOL",
    decimals: 9,
    SolanaDecimals: 9,
    amountDecimals: 4,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/SOL.svg"),
    addresses: {
      near: { mainnet: "22.contract.portalbridge.near" },
      solana: {
        mainnet: "So11111111111111111111111111111111111111112",
        testnet: "So11111111111111111111111111111111111111112"
      }
    }
  },
  JUP: {
    symbol: "JUP",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/jup.png"),
    addresses: {
      solana: { mainnet: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" }
    }
  },
  RAY: {
    symbol: "RAY",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/ray.png"),
    addresses: {
      solana: { mainnet: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" }
    }
  },
  Bonk: {
    symbol: "Bonk",
    decimals: 5,
    SolanaDecimals: 5,
    amountDecimals: 2,
    priceDecimals: 8,
    icon: formatFileUrl("/crypto/bonk.jpg"),
    addresses: {
      solana: { mainnet: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" }
    }
  },
  Moutai: {
    symbol: "Moutai",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl("/crypto/moutai.jpg"),
    addresses: {
      solana: { mainnet: "45EgCwcPXYagBC7KqBin4nCFgEZWN7f3Y6nACwxqMCWX" }
    }
  },
  $WIF: {
    symbol: "$WIF",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/$wif.jpg"),
    addresses: {
      solana: { mainnet: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" }
    }
  },
  mSOL: {
    symbol: "mSOL",
    decimals: 9,
    SolanaDecimals: 9,
    amountDecimals: 4,
    priceDecimals: 2,
    icon: formatFileUrl("/crypto/msol.png"),
    addresses: {
      solana: { mainnet: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So" }
    }
  },
  ORCA: {
    symbol: "ORCA",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 4,
    icon: formatFileUrl("/crypto/orca.png"),
    addresses: {
      solana: { mainnet: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE" }
    }
  },
  KMNO: {
    symbol: "KMNO",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl("/crypto/kmno.svg"),
    addresses: {
      solana: { mainnet: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS" }
    }
  },
  CIGGS: {
    symbol: "CIGGS",
    decimals: 9,
    SolanaDecimals: 9,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl("/crypto/ciggs.png"),
    addresses: {
      solana: { mainnet: "7p6RjGNZ7HLHpfTo6nh21XYw4CZgxXLQPzKXG72pNd2y" }
    }
  },
  BUTT: {
    symbol: "BUTT",
    decimals: 6,
    SolanaDecimals: 6,
    amountDecimals: 2,
    priceDecimals: 6,
    icon: formatFileUrl("/crypto/butt.jpeg"),
    addresses: {
      solana: { mainnet: "3dCCbYca3jSgRdDiMEeV5e3YKNzsZAp3ZVfzUsbb4be4" }
    }
  }
};

// src/utils/token.ts
function getTokenMeta(symbol) {
  return TOKENS[symbol];
}
function getTokenAddress(symbol, chain, network) {
  var _a, _b, _c;
  if (typeof window === "undefined") return;
  const _chain = chain || globalState.get("chain");
  const _network = network || globalState.get("network");
  return (_c = (_b = (_a = TOKENS[symbol]) == null ? void 0 : _a.addresses) == null ? void 0 : _b[_chain]) == null ? void 0 : _c[_network];
}
function getTokenByAddress(address, chain, network) {
  if (typeof window === "undefined") return;
  if (!address) return;
  const _chain = chain || globalState.get("chain");
  const _network = network || globalState.get("network");
  const res = Object.values(TOKENS).find(
    (token) => {
      var _a, _b;
      return ((_b = (_a = token.addresses) == null ? void 0 : _a[_chain]) == null ? void 0 : _b[_network]) === address;
    }
  );
  const decimals = getTokenDecimals(res == null ? void 0 : res.symbol, chain);
  return __spreadProps(__spreadValues({}, res), { decimals });
}
function getTokenDecimals(symbol, chain) {
  var _a, _b;
  if (typeof window === "undefined") return;
  const _chain = chain || globalState.get("chain");
  const decimalsKey = _chain === "solana" ? "SolanaDecimals" : "decimals";
  return ((_a = TOKENS[symbol]) == null ? void 0 : _a[decimalsKey]) || ((_b = TOKENS[symbol]) == null ? void 0 : _b.decimals);
}

// src/utils/request.ts
var cache = /* @__PURE__ */ new Map();
var defaultCacheTimeout = 3e3;
function request(url, options) {
  return __async(this, null, function* () {
    var _a;
    const defaultHeaders = {
      "Content-Type": "application/json"
    };
    const cacheTimeout = (options == null ? void 0 : options.cacheTimeout) || defaultCacheTimeout;
    const headers = __spreadValues(__spreadValues({}, defaultHeaders), options == null ? void 0 : options.headers);
    let body = options == null ? void 0 : options.body;
    if (headers["Content-Type"] === "application/json" && body && typeof body !== "string") {
      body = JSON.stringify(body);
    }
    const method = (options == null ? void 0 : options.method) || "GET";
    const cacheKey = method.toUpperCase() === "GET" ? url : null;
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      const isCacheValid = cached && Date.now() - cached.timestamp < cacheTimeout;
      if (isCacheValid) {
        return Promise.resolve(cached.data);
      }
    }
    const newOptions = __spreadProps(__spreadValues({}, options), {
      headers,
      body,
      method
    });
    const retryCount = (_a = options == null ? void 0 : options.retryCount) != null ? _a : 1;
    const controller = new AbortController();
    const timeout = (options == null ? void 0 : options.timeout) || 2e4;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const res = yield fetch(url, __spreadProps(__spreadValues({}, newOptions), { signal: controller.signal })).finally(
        () => clearTimeout(timeoutId)
      );
      if (!res.ok) throw new Error(res.statusText);
      const data = yield res.json();
      if (cacheKey) {
        cache.set(cacheKey, { timestamp: Date.now(), data });
        setTimeout(() => {
          cache.delete(cacheKey);
        }, cacheTimeout);
      }
      if ((options == null ? void 0 : options.shouldStopPolling) && options.shouldStopPolling(data)) {
        return data;
      }
      return data;
    } catch (err) {
      if (retryCount > 0) {
        return request(url, __spreadProps(__spreadValues({}, options), { retryCount: retryCount - 1 }));
      } else if ((options == null ? void 0 : options.pollingInterval) && (options == null ? void 0 : options.maxPollingAttempts)) {
        if (options.maxPollingAttempts > 0) {
          yield new Promise((resolve) => setTimeout(resolve, options.pollingInterval));
          return request(url, __spreadProps(__spreadValues({}, options), {
            maxPollingAttempts: options.maxPollingAttempts - 1,
            retryCount
          }));
        }
      }
      return Promise.reject(err);
    }
  });
}

// src/services/index.ts
var botInnerApiPrefix = (url, chain) => {
  const _chain = chain || globalState.get("chain");
  const host = _chain === "solana" ? getConfigs().solanaApiHost : getConfigs().apiHost;
  return host + "/api" + url;
};

// src/services/token.ts
var pairServices = {
  pairs: {},
  queryAll() {
    return __async(this, null, function* () {
      if (CHAINS.every((chain) => {
        var _a;
        return (_a = this.pairs[chain]) == null ? void 0 : _a.length;
      })) return this.pairs;
      const res = yield Promise.all(CHAINS.map((chain) => this.query(chain)));
      return res.reduce(
        (acc, cur, i) => {
          acc[CHAINS[i]] = cur;
          return acc;
        },
        {}
      );
    });
  },
  query() {
    return __async(this, arguments, function* (chain = globalState.get("chain")) {
      var _a, _b;
      if ((_a = this.pairs[chain]) == null ? void 0 : _a.length) return this.pairs[chain];
      if ((_b = this.pairs[chain]) == null ? void 0 : _b.length) return this.pairs[chain];
      const { data } = yield request(
        botInnerApiPrefix("/bot/grid/pairs", chain)
      ).catch(() => ({ data: [] }));
      data == null ? void 0 : data.forEach((item) => {
        item.symbol = `${item.base_token.symbol}_${item.quote_token.symbol}`;
        item.chain = chain;
      });
      this.pairs[chain] = data || [];
      return data || [];
    });
  },
  queryPairPrice(pair_id) {
    return __async(this, null, function* () {
      const ids = Array.isArray(pair_id) ? pair_id : [pair_id];
      const prices = yield this.queryPrice();
      const result = {};
      ids.map((id) => {
        var _a;
        const [baseToken, quoteToken] = id.split(":");
        const basePrice = (prices == null ? void 0 : prices[baseToken]) || "0";
        const quotePrice = (prices == null ? void 0 : prices[quoteToken]) || "0";
        const pairPrice = parseDisplayPrice(
          Number(basePrice) / Number(quotePrice),
          (_a = getTokenByAddress(baseToken)) == null ? void 0 : _a.symbol
        );
        result[id] = { pair_id: id, basePrice, quotePrice, pairPrice };
      });
      return result;
    });
  },
  queryPrice(tokens) {
    return __async(this, null, function* () {
      const _tokens = Array.isArray(tokens) ? tokens : tokens ? [tokens] : [];
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/prices"), {
          tokens: _tokens == null ? void 0 : _tokens.join(",")
        }),
        { cacheTimeout: 1e4 }
      );
      return data;
    });
  },
  tickers: {},
  queryTicker(pair_id) {
    return __async(this, null, function* () {
      const ids = Array.isArray(pair_id) ? pair_id : [pair_id];
      const pairPrices = yield this.queryPairPrice(ids);
      const tickers = yield Promise.all(
        ids.map((id) => __async(this, null, function* () {
          const { data } = yield request(
            generateUrl(botInnerApiPrefix("/bot/grid/ticker"), { pair_id: id }),
            { cacheTimeout: 6e4 }
          ).catch(() => ({ data: void 0 }));
          if (!data) return this.tickers[id];
          const price = pairPrices[id].pairPrice;
          const newData = __spreadProps(__spreadValues({}, data), {
            last_price: price
          });
          this.tickers[id] = newData;
          return newData;
        }))
      );
      const result = tickers.reduce(
        (acc, cur) => {
          acc[cur.pair_id] = cur;
          return acc;
        },
        {}
      );
      return result;
    });
  },
  queryPriceByIndexer(symbol) {
    return __async(this, null, function* () {
      const { price } = yield request(
        generateUrl(getConfigs().indexerHost + "/get-token-price", {
          token_id: getTokenAddress(symbol, "near", "mainnet")
        })
      );
      return price;
    });
  },
  queryPriceReport(_0) {
    return __async(this, arguments, function* ({
      base,
      quote,
      dimension = "M"
    }) {
      const { price_list } = yield request(
        generateUrl(getConfigs().indexerHost + "/token-price-report", {
          token: getTokenAddress(base, "near", "mainnet"),
          base_token: getTokenAddress(quote, "near", "mainnet"),
          dimension
        }),
        { retryCount: 0 }
      );
      const res = price_list.map(({ date_time, price }) => ({
        name: date_time,
        value: Number(price)
      }));
      return res;
    });
  },
  queryHistoryPriceReport(_0) {
    return __async(this, arguments, function* ({ base, quote }) {
      const { price_list } = yield request(
        generateUrl(getConfigs().indexerHost + "/history-token-price-report", {
          token: getTokenAddress(base, "near", "mainnet"),
          base_token: getTokenAddress(quote, "near", "mainnet")
        }),
        { retryCount: 0 }
      );
      const res = price_list.map(({ date_time, price }) => ({
        name: date_time,
        value: Number(price)
      }));
      return res;
    });
  }
};

// src/lib/pair.ts
var filterPairs = (pairs, type) => {
  if (!type) return pairs;
  return pairs.filter(
    (pair) => type === "dca" && pair.support_dca || ["grid", "swing"].includes(type) && pair.support_grid
  );
};
function getPairs(params) {
  return __async(this, null, function* () {
    const chain = globalState.get("chain");
    const pairs = yield pairServices.query(chain);
    return filterPairs(pairs, params == null ? void 0 : params.type);
  });
}
function getPairPrices(pairId) {
  return __async(this, null, function* () {
    const res = yield pairServices.queryPairPrice(pairId);
    return res;
  });
}

// src/services/bot/index.ts
import Big3 from "big.js";

// src/services/bot/contract.ts
import Big2 from "big.js";

// src/config/rpc.ts
var NEAR_RPC_NODE_URLS = {
  mainnet: {
    Lava: "https://near.lava.build",
    Official: "https://rpc.mainnet.near.org",
    Fastnear: "https://free.rpc.fastnear.com",
    Drpc: "https://near.drpc.org"
  },
  testnet: {
    Lava: "https://near-testnet.lava.build",
    Official: "https://rpc.testnet.near.org",
    Drpc: "https://near-testnet.drpc.org"
  }
};
var SOLANA_RPC_NODE_URLS = {
  mainnet: {
    Delta: "https://solana.deltarpc.com/",
    XNFT: "https://swr.xnftdata.com/rpc-proxy/"
    // Chainstack: 'https://solana-mainnet.core.chainstack.com/ed9e4c2d2237fa74cb0a4d61fa07cf79',
  },
  testnet: {
    Official: "https://api.devnet.solana.com"
  }
};
function getRPCNodeUrls(chain, network) {
  return chain === "near" ? NEAR_RPC_NODE_URLS[network] : SOLANA_RPC_NODE_URLS[network];
}

// src/services/contract.ts
import { connect, providers, keyStores } from "near-api-js";
import {
  Connection as solanaConnection,
  PublicKey,
  Transaction as solanaTransaction
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  createCloseAccountInstruction
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
var NEAR_DECIMALS = 24;
var NEAR_TGAS_DECIMALS = 12;
var STORAGE_DEPOSIT_FEE = "1250000000000000000000";
var contractServices = {
  getBalance(tokenAddress) {
    switch (globalState.get("chain")) {
      case "near":
        return nearContractServices.getBalance(tokenAddress);
      case "solana":
        return solanaContractServices.getBalance(tokenAddress);
    }
  }
};
var nearContractServices = {
  getConnectionConfig(network = globalState.get("network")) {
    var _a;
    const rpcUrls = ((_a = globalState.get("nearConfig")) == null ? void 0 : _a.jsonRpcUrls) || Object.values(getRPCNodeUrls("near", network));
    const nodeUrl = rpcUrls[0];
    const jsonRpcProvider = rpcUrls.map((url) => new providers.JsonRpcProvider({ url }));
    const provider = new providers.FailoverRpcProvider(jsonRpcProvider);
    return {
      networkId: network,
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl,
      provider,
      walletUrl: network === "mainnet" ? "https://app.near.org" : "https://wallet.testnet.near.org",
      helperUrl: network === "mainnet" ? "https://helper.near.org" : "https://helper.testnet.near.org",
      explorerUrl: network === "mainnet" ? "https://explorer.near.org" : "https://explorer.testnet.near.org",
      indexerUrl: network === "mainnet" ? "https://near-api.deltatrade.ai" : "https://testnet-api.deltatrade.ai"
    };
  },
  near: {},
  connect() {
    return __async(this, arguments, function* (network = globalState.get("network")) {
      if (this.near[network]) return this.near[network];
      const near = yield connect(this.getConnectionConfig(network));
      this.near[network] = near;
      return near;
    });
  },
  query(_0) {
    return __async(this, arguments, function* ({
      contractId,
      method,
      args = {},
      network
    }) {
      try {
        const { connection } = yield this.connect(network);
        const res = yield connection.provider.query({
          request_type: "call_function",
          account_id: contractId,
          method_name: method,
          args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
          finality: "final"
        });
        const result = JSON.parse(
          Buffer.from(res.result).toString()
        );
        return result;
      } catch (error) {
      }
    });
  },
  getNearBalance() {
    return __async(this, null, function* () {
      try {
        const accountId = globalState.get("accountId");
        const { connection } = yield this.connect();
        const res = yield connection.provider.query({
          request_type: "view_account",
          account_id: accountId,
          finality: "final"
        });
        const tokenMeta = yield this.queryTokenMetadata(getTokenAddress("NEAR") || "");
        const amount = "amount" in res ? res.amount : "0";
        const readableAmount = formatAmount(amount, tokenMeta == null ? void 0 : tokenMeta.decimals);
        return readableAmount;
      } catch (error) {
        return "0";
      }
    });
  },
  /** get balance, if tokenAddress is undefined, get NEAR balance */
  getBalance(address, decimals) {
    return __async(this, null, function* () {
      try {
        if (address === getTokenAddress("NEAR")) {
          return this.getNearBalance();
        } else {
          const amount = (yield this.query({
            contractId: address,
            method: "ft_balance_of",
            args: { account_id: globalState.get("accountId") }
          })) || "0";
          const tokenMeta = yield this.queryTokenMetadata(address);
          const readableAmount = formatAmount(amount, tokenMeta == null ? void 0 : tokenMeta.decimals);
          return readableAmount;
        }
      } catch (error) {
        return "0";
      }
    });
  },
  tokenMeta: {},
  queryTokenMetadata(token) {
    return __async(this, null, function* () {
      if (!(token == null ? void 0 : token.length)) return;
      const tokenArr = Array.isArray(token) ? token : [token];
      const tokensToQuery = tokenArr.filter((t) => !this.tokenMeta[t]);
      if (tokensToQuery.length > 0) {
        const res = yield Promise.allSettled(
          tokensToQuery.map(
            (token2) => this.query({ contractId: token2, method: "ft_metadata" })
          )
        );
        const tokenMeta = res.reduce(
          (acc, token2, index) => {
            if (token2.status === "fulfilled" && token2.value) {
              const tokenMeta2 = token2.value;
              if (tokenMeta2.symbol === "wNEAR") {
                tokenMeta2.symbol = "NEAR";
                tokenMeta2.icon = formatFileUrl("/assets/crypto/near.svg");
              }
              acc[tokensToQuery[index]] = tokenMeta2;
            }
            return acc;
          },
          {}
        );
        Object.assign(this.tokenMeta, tokenMeta);
      }
      if (typeof token === "string") {
        return this.tokenMeta[token];
      }
      return tokenArr.length ? this.tokenMeta : void 0;
    });
  },
  transformTransactionActions(params) {
    return __async(this, null, function* () {
      var _a;
      const accountId = globalState.get("accountId");
      const minGas = parseAmount(30, NEAR_TGAS_DECIMALS);
      const defaultGas = parseAmount(200 / params.length, NEAR_TGAS_DECIMALS);
      const result = [];
      for (const p of params) {
        const { contractId, actions } = p;
        const transaction = {
          receiverId: contractId,
          signerId: accountId,
          actions: []
        };
        for (const action of actions) {
          const { method, args = {}, gas = defaultGas, deposit = "0" } = action;
          const parsedArgs = JSON.parse(JSON.stringify(args));
          transaction.actions.push({
            type: "FunctionCall",
            params: {
              methodName: method,
              args: parsedArgs,
              gas,
              deposit
            }
          });
          if (method === "ft_transfer_call" && parsedArgs.amount) {
            if (contractId === getTokenAddress("NEAR")) {
              transaction.actions.unshift({
                type: "FunctionCall",
                params: {
                  methodName: "near_deposit",
                  args: {},
                  deposit: parsedArgs.amount,
                  gas: minGas
                }
              });
            }
            const storageDepositTransaction = yield this.registerToken(contractId, accountId);
            if ((_a = storageDepositTransaction == null ? void 0 : storageDepositTransaction.actions) == null ? void 0 : _a[0]) {
              transaction.actions.unshift({
                type: "FunctionCall",
                params: {
                  methodName: storageDepositTransaction.actions[0].method,
                  args: storageDepositTransaction.actions[0].args,
                  deposit: storageDepositTransaction.actions[0].deposit || STORAGE_DEPOSIT_FEE,
                  gas: minGas
                }
              });
            }
          }
        }
        if (transaction.actions.length) {
          result.push(transaction);
        }
      }
      return result;
    });
  },
  registerToken(token, recipient) {
    return __async(this, null, function* () {
      const res = yield this.query({
        contractId: token,
        method: "storage_balance_of",
        args: { account_id: recipient }
      });
      if (!(res == null ? void 0 : res.available) || res.available === "0") {
        return {
          contractId: token,
          actions: [
            {
              method: "storage_deposit",
              args: { account_id: recipient, registration_only: true },
              deposit: STORAGE_DEPOSIT_FEE,
              gas: parseAmount(30, NEAR_TGAS_DECIMALS)
            }
          ]
        };
      }
    });
  }
};
var solanaContractServices = {
  solana: {},
  connect(network = globalState.get("network")) {
    var _a;
    if (this.solana[network]) return this.solana[network];
    const endPoint = ((_a = globalState.get("solanaConfig")) == null ? void 0 : _a.endpoint) || Object.values(getRPCNodeUrls("solana", network))[0];
    const connection = new solanaConnection(endPoint, { commitment: "confirmed" });
    this.solana[network] = connection;
    return connection;
  },
  getSolanaBalance() {
    return __async(this, null, function* () {
      var _a;
      try {
        const connection = this.connect();
        const publicKey = new PublicKey(globalState.get("accountId"));
        const res = yield connection.getBalance(publicKey);
        return formatAmount(res, (_a = getTokenMeta("SOL")) == null ? void 0 : _a.SolanaDecimals);
      } catch (error) {
        return "0";
      }
    });
  },
  getWrapSolanaBalance() {
    return __async(this, null, function* () {
      try {
        const connection = this.connect();
        const publicKey = new PublicKey(globalState.get("accountId"));
        const tokenAccount = yield getAssociatedTokenAddress(
          NATIVE_MINT,
          publicKey,
          true,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const res = yield connection.getTokenAccountBalance(tokenAccount);
        return formatAmount(res.value.amount, res.value.decimals);
      } catch (error) {
        return "0";
      }
    });
  },
  getBalance(tokenAddress) {
    return __async(this, null, function* () {
      var _a;
      try {
        if (((_a = getTokenByAddress(tokenAddress, "solana")) == null ? void 0 : _a.symbol) === "SOL")
          return this.getSolanaBalance();
        const connection = this.connect();
        const publicKey = new PublicKey(globalState.get("accountId"));
        const tokenAccount = yield getAssociatedTokenAddress(
          new PublicKey(tokenAddress),
          publicKey,
          true,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const res = yield connection.getTokenAccountBalance(tokenAccount);
        return formatAmount(res.value.amount, res.value.decimals);
      } catch (error) {
        return "0";
      }
    });
  },
  findProgramAddressSync(seeds, programId) {
    const res = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
    return res;
  },
  convertSOL(type, amount) {
    return __async(this, null, function* () {
      const connection = this.connect();
      const publicKey = new PublicKey(globalState.get("accountId"));
      const associatedToken = yield getAssociatedTokenAddress(
        NATIVE_MINT,
        publicKey,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const transaction = new solanaTransaction();
      const accountInfo = yield connection.getAccountInfo(associatedToken);
      if (type === "wrap") {
        if (!accountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              associatedToken,
              publicKey,
              NATIVE_MINT
            )
          );
        }
        transaction.add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: associatedToken,
            lamports: amount
          }),
          createSyncNativeInstruction(associatedToken, TOKEN_PROGRAM_ID)
        );
      } else if (type === "unwrap") {
        transaction.add(createCloseAccountInstruction(associatedToken, publicKey, publicKey));
      } else {
        throw new Error('Invalid type specified. Use "wrap" or "unwrap".');
      }
      return { transaction };
    });
  },
  approve(payerTokenAccount, delegate, amount) {
    return __async(this, null, function* () {
      var _a;
      const connection = this.connect();
      const ownerPublicKey = new PublicKey(globalState.get("accountId"));
      const tokenAccountInfo = yield getAccount(connection, payerTokenAccount);
      if (((_a = tokenAccountInfo.delegate) == null ? void 0 : _a.equals(delegate)) && tokenAccountInfo.delegatedAmount >= amount)
        return;
      const transaction = createApproveInstruction(
        payerTokenAccount,
        delegate,
        ownerPublicKey,
        amount
      );
      return { transaction };
    });
  },
  createAssociatedTokenAccount(mint, owner) {
    return __async(this, null, function* () {
      const connection = this.connect();
      const publicKey = new PublicKey(globalState.get("accountId"));
      const associatedAddress = yield getAssociatedTokenAddress(mint, owner);
      const associatedAccount = yield connection.getAccountInfo(associatedAddress);
      if (!associatedAccount) {
        const transaction = createAssociatedTokenAccountInstruction(
          publicKey,
          associatedAddress,
          owner,
          mint
        );
        return { transaction };
      }
    });
  }
};

// src/services/bot/contract.ts
import * as anchor2 from "@coral-xyz/anchor";
import { PublicKey as PublicKey2 } from "@solana/web3.js";

// src/services/idl/deltabot.ts
var IDL = {
  version: "0.1.0",
  name: "deltabot",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "ownerId",
          isMut: false,
          isSigner: false
        },
        {
          name: "gridBotState",
          isMut: true,
          isSigner: true
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "createBotAccount",
      accounts: [
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "userState",
          isMut: true,
          isSigner: false
        },
        {
          name: "gridBot",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "gridSellCount",
          type: "u16"
        },
        {
          name: "gridBuyCount",
          type: "u16"
        }
      ]
    },
    {
      name: "createBot",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "userState",
          isMut: true,
          isSigner: false
        },
        {
          name: "baseMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false
        },
        {
          name: "pair",
          isMut: false,
          isSigner: false
        },
        {
          name: "gridBot",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalanceBaseUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceBase",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalanceQuoteUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceQuote",
          isMut: true,
          isSigner: false
        },
        {
          name: "depositLimitBase",
          isMut: false,
          isSigner: false
        },
        {
          name: "depositLimitQuote",
          isMut: false,
          isSigner: false
        },
        {
          name: "userBaseTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "userQuoteTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "referralRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "name",
          type: "string"
        },
        {
          name: "gridType",
          type: "u8"
        },
        {
          name: "gridRate",
          type: "u16"
        },
        {
          name: "gridOffset",
          type: "u64"
        },
        {
          name: "firstBaseAmount",
          type: "u64"
        },
        {
          name: "firstQuoteAmount",
          type: "u64"
        },
        {
          name: "lastBaseAmount",
          type: "u64"
        },
        {
          name: "lastQuoteAmount",
          type: "u64"
        },
        {
          name: "fillBaseOrQuote",
          type: "bool"
        },
        {
          name: "validUntilTime",
          type: "u64"
        },
        {
          name: "entryPrice",
          type: "u64"
        },
        {
          name: "recommenderOp",
          type: {
            option: "publicKey"
          }
        }
      ]
    },
    {
      name: "closeBot",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "baseMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "pair",
          isMut: false,
          isSigner: false
        },
        {
          name: "gridBot",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalanceBaseUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceBase",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalanceQuoteUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceQuote",
          isMut: true,
          isSigner: false
        },
        {
          name: "userBaseTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "userQuoteTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "closeBotParam",
          type: {
            defined: "CloseBotParam"
          }
        }
      ]
    },
    {
      name: "createOrders",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "makerForwardOrder",
          isMut: true,
          isSigner: false
        },
        {
          name: "makerReverseOrder",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "createOrderParam",
          type: {
            defined: "CreateOrdersParam"
          }
        }
      ]
    },
    {
      name: "takeOrders",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "pair",
          isMut: false,
          isSigner: false
        },
        {
          name: "clock",
          isMut: false,
          isSigner: false
        },
        {
          name: "takerTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "takerBuyTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "makerGridBot",
          isMut: true,
          isSigner: false
        },
        {
          name: "makerForwardOrder",
          isMut: true,
          isSigner: false
        },
        {
          name: "makerReverseOrder",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalanceBaseUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceBase",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalanceQuoteUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceQuote",
          isMut: true,
          isSigner: false
        },
        {
          name: "protocolBalanceBaseRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "protocolBalanceQuoteRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "makerUsers",
          isMut: false,
          isSigner: false
        },
        {
          name: "takerSellLimit",
          isMut: true,
          isSigner: false
        },
        {
          name: "referralRecord",
          isMut: false,
          isSigner: false
        },
        {
          name: "referralBaseFee",
          isMut: true,
          isSigner: false
        },
        {
          name: "referralQuoteFee",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "takeOrderParam",
          type: {
            defined: "TakeOrdersParam"
          }
        }
      ]
    },
    {
      name: "claim",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "baseMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "gridBot",
          isMut: true,
          isSigner: false
        },
        {
          name: "pair",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceBaseUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceBase",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalanceQuoteUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceQuote",
          isMut: true,
          isSigner: false
        },
        {
          name: "userBaseTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "userQuoteTokenAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "claimParam",
          type: {
            defined: "ClaimParam"
          }
        }
      ]
    },
    {
      name: "setOwner",
      accounts: [
        {
          name: "newOwnerId",
          isMut: false,
          isSigner: false
        },
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "registerGlobalToken",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "globalBalanceUser",
          isMut: true,
          isSigner: false
        },
        {
          name: "globalBalance",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "registerProtocolToken",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false
        },
        {
          name: "protocolRecord",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "registerDepositLimit",
      accounts: [
        {
          name: "token",
          isMut: false,
          isSigner: false
        },
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "depositLimit",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "registerPair",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "pair",
          isMut: true,
          isSigner: false
        },
        {
          name: "baseMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false
        },
        {
          name: "depositLimitBase",
          isMut: true,
          isSigner: false
        },
        {
          name: "depositLimitQuote",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "baseMinDeposit",
          type: "u64"
        },
        {
          name: "quoteMinDeposit",
          type: "u64"
        }
      ]
    },
    {
      name: "setMinDeposit",
      accounts: [
        {
          name: "token",
          isMut: false,
          isSigner: false
        },
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "depositLimit",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "minDeposit",
          type: "u64"
        }
      ]
    },
    {
      name: "setProtocolFeeRate",
      accounts: [
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "newProtocolFeeRate",
          type: "u32"
        },
        {
          name: "newTakerFeeRate",
          type: "u32"
        }
      ]
    },
    {
      name: "setReferralFeeRate",
      accounts: [
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "newReferralFeeRate",
          type: "u32"
        }
      ]
    },
    {
      name: "withdrawProtocolFee",
      accounts: [
        {
          name: "gridBotState",
          isMut: false,
          isSigner: false
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false
        },
        {
          name: "toUser",
          isMut: true,
          isSigner: false
        },
        {
          name: "protocolBalanceUser",
          isMut: false,
          isSigner: false
        },
        {
          name: "protocolBalance",
          isMut: true,
          isSigner: false
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "amount",
          type: "u64"
        },
        {
          name: "bump",
          type: "u8"
        }
      ]
    },
    {
      name: "start",
      accounts: [
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "pause",
      accounts: [
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "shutdown",
      accounts: [
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "setMakerUser",
      accounts: [
        {
          name: "gridBotState",
          isMut: true,
          isSigner: false
        },
        {
          name: "makerUsers",
          isMut: true,
          isSigner: false
        },
        {
          name: "user",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "makerUser",
          type: "publicKey"
        },
        {
          name: "enable",
          type: "bool"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "makerUsers",
      type: {
        kind: "struct",
        fields: [
          {
            name: "users",
            type: {
              vec: "publicKey"
            }
          }
        ]
      }
    },
    {
      name: "gridBotState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isInitialized",
            type: "bool"
          },
          {
            name: "ownerId",
            type: "publicKey"
          },
          {
            name: "oracleValidTime",
            type: "u64"
          },
          {
            name: "status",
            type: {
              defined: "GridStatus"
            }
          },
          {
            name: "protocolFeeRate",
            docs: ["real_protocol_fee = protocol_fee / 1000000"],
            type: "u32"
          },
          {
            name: "takerFeeRate",
            type: "u32"
          },
          {
            name: "referFeeRate",
            type: "u32"
          },
          {
            name: "nextBotId",
            docs: ["start from 0, used from 1"],
            type: "u64"
          }
        ]
      }
    },
    {
      name: "userState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "nextUserBotId",
            type: "u32"
          }
        ]
      }
    },
    {
      name: "dataRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "data",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "referralRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey"
          }
        ]
      }
    },
    {
      name: "gridBot",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isInitialized",
            type: "bool"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "active",
            type: "bool"
          },
          {
            name: "user",
            type: "publicKey"
          },
          {
            name: "botId",
            type: "u64"
          },
          {
            name: "closed",
            type: "bool"
          },
          {
            name: "pairId",
            type: "string"
          },
          {
            name: "gridType",
            type: "u8"
          },
          {
            name: "gridSellCount",
            type: "u16"
          },
          {
            name: "gridBuyCount",
            type: "u16"
          },
          {
            name: "gridRate",
            docs: ["real_grid_rate = grid_rate / 10000"],
            type: "u16"
          },
          {
            name: "gridOffset",
            type: "u64"
          },
          {
            name: "firstBaseAmount",
            type: "u64"
          },
          {
            name: "firstQuoteAmount",
            type: "u64"
          },
          {
            name: "lastBaseAmount",
            type: "u64"
          },
          {
            name: "lastQuoteAmount",
            type: "u64"
          },
          {
            name: "fillBaseOrQuote",
            type: "bool"
          },
          {
            name: "validUntilTime",
            type: "u64"
          },
          {
            name: "totalQuoteAmount",
            type: "u64"
          },
          {
            name: "totalBaseAmount",
            type: "u64"
          },
          {
            name: "revenue",
            type: "u64"
          },
          {
            name: "totalRevenue",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "order",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tokenSellIsBase",
            type: "bool"
          },
          {
            name: "fillBuyOrSell",
            type: "bool"
          },
          {
            name: "amountSell",
            type: "u64"
          },
          {
            name: "amountBuy",
            type: "u64"
          },
          {
            name: "filled",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "pair",
      type: {
        kind: "struct",
        fields: [
          {
            name: "baseToken",
            type: "publicKey"
          },
          {
            name: "quoteToken",
            type: "publicKey"
          }
        ]
      }
    },
    {
      name: "accountBalance",
      type: {
        kind: "struct",
        fields: [
          {
            name: "balance",
            type: "u128"
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "GridBotOutput",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isInitialized",
            type: "bool"
          },
          {
            name: "name",
            type: "string"
          },
          {
            name: "active",
            type: "bool"
          },
          {
            name: "user",
            type: "publicKey"
          },
          {
            name: "botId",
            type: "u64"
          },
          {
            name: "closed",
            type: "bool"
          },
          {
            name: "pairId",
            type: "string"
          },
          {
            name: "gridType",
            type: "u8"
          },
          {
            name: "gridSellCount",
            type: "u16"
          },
          {
            name: "gridBuyCount",
            type: "u16"
          },
          {
            name: "gridRate",
            docs: ["real_grid_rate = grid_rate / 10000"],
            type: "u16"
          },
          {
            name: "gridOffset",
            type: "u64"
          },
          {
            name: "firstBaseAmount",
            type: "u64"
          },
          {
            name: "firstQuoteAmount",
            type: "u64"
          },
          {
            name: "lastBaseAmount",
            type: "u64"
          },
          {
            name: "lastQuoteAmount",
            type: "u64"
          },
          {
            name: "fillBaseOrQuote",
            type: "bool"
          },
          {
            name: "validUntilTime",
            type: "u64"
          },
          {
            name: "totalQuoteAmount",
            type: "u64"
          },
          {
            name: "totalBaseAmount",
            type: "u64"
          },
          {
            name: "revenue",
            type: "u64"
          },
          {
            name: "totalRevenue",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "PairOutput",
      type: {
        kind: "struct",
        fields: [
          {
            name: "baseToken",
            type: "publicKey"
          },
          {
            name: "quoteToken",
            type: "publicKey"
          }
        ]
      }
    },
    {
      name: "CloseBotParam",
      type: {
        kind: "struct",
        fields: [
          {
            name: "userStateId",
            type: "u32"
          },
          {
            name: "globalBaseBump",
            type: "u8"
          },
          {
            name: "globalQuoteBump",
            type: "u8"
          }
        ]
      }
    },
    {
      name: "ClaimParam",
      type: {
        kind: "struct",
        fields: [
          {
            name: "userStateId",
            type: "u32"
          },
          {
            name: "globalBaseBump",
            type: "u8"
          },
          {
            name: "globalQuoteBump",
            type: "u8"
          }
        ]
      }
    },
    {
      name: "TakeOrdersParam",
      type: {
        kind: "struct",
        fields: [
          {
            name: "baseMint",
            type: "publicKey"
          },
          {
            name: "quoteMint",
            type: "publicKey"
          },
          {
            name: "makerKey",
            type: "publicKey"
          },
          {
            name: "makerUserStateId",
            type: "u32"
          },
          {
            name: "makerLevel",
            type: "u16"
          },
          {
            name: "makerForwardOrReverse",
            type: "bool"
          },
          {
            name: "tokenSell",
            type: "publicKey"
          },
          {
            name: "tokenBuy",
            type: "publicKey"
          },
          {
            name: "amountSell",
            type: "u64"
          },
          {
            name: "amountBuy",
            type: "u64"
          },
          {
            name: "fillBuyOrSell",
            type: "bool"
          },
          {
            name: "globalBaseBump",
            type: "u8"
          },
          {
            name: "globalQuoteBump",
            type: "u8"
          }
        ]
      }
    },
    {
      name: "CreateOrdersParam",
      type: {
        kind: "struct",
        fields: [
          {
            name: "makerKey",
            type: "publicKey"
          },
          {
            name: "makerUserStateId",
            type: "u32"
          },
          {
            name: "makerLevel",
            type: "u16"
          }
        ]
      }
    },
    {
      name: "GridStatus",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Running"
          },
          {
            name: "Paused"
          },
          {
            name: "Shutdown"
          }
        ]
      }
    }
  ],
  events: [
    {
      name: "RegisterPairEvent",
      fields: [
        {
          name: "baseToken",
          type: "publicKey",
          index: false
        },
        {
          name: "quoteToken",
          type: "publicKey",
          index: false
        }
      ]
    },
    {
      name: "CreateEvent",
      fields: [
        {
          name: "accountId",
          type: "publicKey",
          index: false
        },
        {
          name: "botId",
          type: "string",
          index: false
        },
        {
          name: "userStateId",
          type: "string",
          index: false
        },
        {
          name: "basePrice",
          type: "string",
          index: false
        },
        {
          name: "quotePrice",
          type: "string",
          index: false
        },
        {
          name: "baseExpo",
          type: "string",
          index: false
        },
        {
          name: "quoteExpo",
          type: "string",
          index: false
        },
        {
          name: "entryPrice",
          type: "u64",
          index: false
        },
        {
          name: "pair",
          type: {
            defined: "PairOutput"
          },
          index: false
        },
        {
          name: "gridBot",
          type: {
            defined: "GridBotOutput"
          },
          index: false
        }
      ]
    },
    {
      name: "CloseEvent",
      fields: [
        {
          name: "accountId",
          type: "publicKey",
          index: false
        },
        {
          name: "botId",
          type: "string",
          index: false
        },
        {
          name: "userStateId",
          type: "string",
          index: false
        },
        {
          name: "refund",
          type: "u64",
          index: false
        }
      ]
    },
    {
      name: "OrderUpdateEvent",
      fields: [
        {
          name: "botId",
          type: "string",
          index: false
        },
        {
          name: "userStateId",
          type: "string",
          index: false
        },
        {
          name: "forwardOrReverse",
          type: "bool",
          index: false
        },
        {
          name: "level",
          type: "u16",
          index: false
        },
        {
          name: "tokenSell",
          type: "publicKey",
          index: false
        },
        {
          name: "tokenBuy",
          type: "publicKey",
          index: false
        },
        {
          name: "amountSell",
          type: "u64",
          index: false
        },
        {
          name: "amountBuy",
          type: "u64",
          index: false
        },
        {
          name: "fillBuyOrSell",
          type: "bool",
          index: false
        },
        {
          name: "filled",
          type: "u64",
          index: false
        }
      ]
    },
    {
      name: "TakeOrderEvent",
      fields: [
        {
          name: "taker",
          type: "publicKey",
          index: false
        },
        {
          name: "maker",
          type: "publicKey",
          index: false
        },
        {
          name: "makerBotId",
          type: "string",
          index: false
        },
        {
          name: "makerUserStateId",
          type: "string",
          index: false
        },
        {
          name: "makerForwardOrReverse",
          type: "bool",
          index: false
        },
        {
          name: "makerLevel",
          type: "u16",
          index: false
        },
        {
          name: "tookSell",
          type: "u64",
          index: false
        },
        {
          name: "tookBuy",
          type: "u64",
          index: false
        },
        {
          name: "takerFee",
          type: "u64",
          index: false
        },
        {
          name: "protocolFee",
          type: "u64",
          index: false
        },
        {
          name: "referralFee",
          type: "u64",
          index: false
        },
        {
          name: "currentRevenue",
          type: "u64",
          index: false
        },
        {
          name: "makerLeftRevenue",
          type: "u64",
          index: false
        },
        {
          name: "makerTotalRevenue",
          type: "u64",
          index: false
        }
      ]
    },
    {
      name: "WithdrawEvent",
      fields: [
        {
          name: "from",
          type: "publicKey",
          index: false
        },
        {
          name: "to",
          type: "publicKey",
          index: false
        },
        {
          name: "amount",
          type: "u64",
          index: false
        },
        {
          name: "tokenId",
          type: "publicKey",
          index: false
        }
      ]
    },
    {
      name: "ReferralEvent",
      fields: [
        {
          name: "user",
          type: "publicKey",
          index: false
        },
        {
          name: "recommender",
          type: "publicKey",
          index: false
        },
        {
          name: "amount",
          type: "u64",
          index: false
        },
        {
          name: "tokenId",
          type: "publicKey",
          index: false
        }
      ]
    },
    {
      name: "TransferEvent",
      fields: [
        {
          name: "from",
          type: "publicKey",
          index: false
        },
        {
          name: "to",
          type: "publicKey",
          index: false
        },
        {
          name: "amount",
          type: "u64",
          index: false
        },
        {
          name: "tokenId",
          type: "publicKey",
          index: false
        }
      ]
    },
    {
      name: "ClaimEvent",
      fields: [
        {
          name: "claimUser",
          type: "publicKey",
          index: false
        },
        {
          name: "botId",
          type: "string",
          index: false
        },
        {
          name: "userStateId",
          type: "string",
          index: false
        },
        {
          name: "user",
          type: "publicKey",
          index: false
        },
        {
          name: "revenueToken",
          type: "publicKey",
          index: false
        },
        {
          name: "revenue",
          type: "u64",
          index: false
        }
      ]
    }
  ],
  errors: [
    {
      code: 6e3,
      name: "InvalidProgramId",
      msg: "InvalidProgramId"
    },
    {
      code: 6001,
      name: "UnexpectedAccount",
      msg: "UnexpectedAccount"
    },
    {
      code: 6002,
      name: "Initialized",
      msg: "Initialized"
    },
    {
      code: 6003,
      name: "NotAllowed",
      msg: "NotAllowed"
    },
    {
      code: 6004,
      name: "InvalidToken",
      msg: "InvalidToken"
    },
    {
      code: 6005,
      name: "InvalidOracleId",
      msg: "InvalidOracleId"
    },
    {
      code: 6006,
      name: "HadShutdown",
      msg: "HadShutdown"
    },
    {
      code: 6007,
      name: "InvalidFeeRate",
      msg: "InvalidFeeRate"
    },
    {
      code: 6008,
      name: "InvalidAmount",
      msg: "InvalidAmount"
    },
    {
      code: 6009,
      name: "InvalidUntilTime",
      msg: "InvalidUntilTime"
    },
    {
      code: 6010,
      name: "InvalidPair",
      msg: "InvalidPair"
    },
    {
      code: 6011,
      name: "PauseOrShutdown",
      msg: "PauseOrShutdown"
    },
    {
      code: 6012,
      name: "MoreThanMaxGridCount",
      msg: "MoreThanMaxGridCount"
    },
    {
      code: 6013,
      name: "LessThanMinGridCount",
      msg: "LessThanMinGridCount"
    },
    {
      code: 6014,
      name: "InvalidFirstOrLastAmount",
      msg: "InvalidFirstOrLastAmount"
    },
    {
      code: 6015,
      name: "BaseTooSmall",
      msg: "BaseTooSmall"
    },
    {
      code: 6016,
      name: "QuoteTooSmall",
      msg: "QuoteTooSmall"
    },
    {
      code: 6017,
      name: "LessBaseToken",
      msg: "LessBaseToken"
    },
    {
      code: 6018,
      name: "LessQuoteToken",
      msg: "LessQuoteToken"
    },
    {
      code: 6019,
      name: "InvalidBotStatus",
      msg: "InvalidBotStatus"
    },
    {
      code: 6020,
      name: "InvalidUser",
      msg: "InvalidUser"
    },
    {
      code: 6021,
      name: "InvalidOrderAmount",
      msg: "InvalidOrderAmount"
    },
    {
      code: 6022,
      name: "LessTokenSell",
      msg: "LessTokenSell"
    },
    {
      code: 6023,
      name: "InvalidOrderToken",
      msg: "InvalidOrderToken"
    },
    {
      code: 6024,
      name: "BotClosed",
      msg: "BotClosed"
    },
    {
      code: 6025,
      name: "BotDisable",
      msg: "BotDisable"
    },
    {
      code: 6026,
      name: "BotExpired",
      msg: "BotExpired"
    },
    {
      code: 6027,
      name: "InvalidMakerForwardOrReverse",
      msg: "InvalidMakerForwardOrReverse"
    },
    {
      code: 6028,
      name: "InvalidOrderMatching",
      msg: "InvalidOrderMatching"
    },
    {
      code: 6029,
      name: "InvalidName",
      msg: "InvalidName"
    },
    {
      code: 6030,
      name: "OrderPriceNotMatch",
      msg: "OrderPriceNotMatch"
    }
  ]
};

// src/services/bot/contract.ts
import {
  ASSOCIATED_TOKEN_PROGRAM_ID as ASSOCIATED_TOKEN_PROGRAM_ID2,
  getAssociatedTokenAddress as getAssociatedTokenAddress2,
  TOKEN_PROGRAM_ID as TOKEN_PROGRAM_ID2
} from "@solana/spl-token";

// src/config/bot.ts
var SOLANA_MIN_DEPOSIT = {
  SOL: 0.16,
  // SOL: 0.01,
  WSOL: 0.16,
  JUP: 30,
  WBTC: 35e-5,
  WETH: 84e-4,
  RAY: 13.5,
  Bonk: 12e5,
  Moutai: 3e3,
  $WIF: 13.5,
  mSOL: 0.125,
  ORCA: 11.5,
  KMNO: 520,
  CIGGS: 8e4,
  BUTT: 24e3
};

// src/services/bot/contract.ts
var BOT_PRICE_DECIMALS = 18;
var DCA_PRICE_DECIMALS = 10;
var botContractServices = {
  queryMinDeposit(botType, token) {
    return __async(this, null, function* () {
      const priceRes = yield pairServices.queryPrice(token.code);
      const price = priceRes == null ? void 0 : priceRes[token.code];
      const minDepositByPrice = price ? new Big2(10).div(price).round(8, Big2.roundUp).toString() : "0";
      const minDepositByContract = globalState.get("chain") === "near" ? yield botNearContractServices.queryMinDeposit(botType, token) : yield botSolanaContractServices.queryMinDeposit(botType, token);
      return new Big2(minDepositByPrice || 0).gt(minDepositByContract || 0) ? minDepositByPrice : minDepositByContract;
    });
  },
  queryUserBalance(token, decimals) {
    return __async(this, null, function* () {
      switch (globalState.get("chain")) {
        case "near":
          return botNearContractServices.queryUserBalance(token, decimals);
        case "solana":
          return botSolanaContractServices.queryUserBalance(token, decimals);
      }
    });
  },
  queryBotStorageFee(gridCount) {
    switch (globalState.get("chain")) {
      case "near":
        return botNearContractServices.queryBotStorageFee(gridCount);
      case "solana":
        return botSolanaContractServices.queryBotStorageFee(gridCount);
    }
  }
};
var botNearContractServices = {
  queryMinDeposit(botType, token) {
    return __async(this, null, function* () {
      const result = yield nearContractServices.query({
        contractId: botType === "dca" ? getConfigs().nearDCAContract : getConfigs().nearGridContract,
        method: "query_min_deposit",
        args: { token: token.code }
      });
      const formattedResult = formatAmount(result, token.decimals);
      const multiplier = botType === "dca" ? 1 : 1.5;
      return new Big2(formattedResult || 0).times(multiplier).toString();
    });
  },
  createGridBot(params) {
    return __async(this, null, function* () {
      try {
        const {
          type,
          grid_type,
          grid_offset,
          grid_rate,
          trigger_price,
          take_profit_price,
          stop_loss_price,
          valid_until_time,
          first_base_amount,
          first_quote_amount,
          last_base_amount,
          last_quote_amount,
          entry_price,
          slippage,
          total_base_investment,
          total_quote_investment,
          base_token,
          quote_token,
          name,
          pair_id,
          fill_base_or_quote,
          grid_buy_count,
          grid_sell_count,
          recommender
        } = params;
        const formattedParams = {
          grid_type,
          grid_offset: grid_type === "EqOffset" ? parseAmount(
            grid_offset,
            fill_base_or_quote ? quote_token == null ? void 0 : quote_token.decimals : base_token == null ? void 0 : base_token.decimals
          ) : "0",
          grid_rate: grid_type === "EqRate" ? grid_rate : 0,
          trigger_price: parseAmount(trigger_price, BOT_PRICE_DECIMALS),
          take_profit_price: parseAmount(take_profit_price, BOT_PRICE_DECIMALS),
          stop_loss_price: parseAmount(stop_loss_price, BOT_PRICE_DECIMALS),
          valid_until_time,
          slippage: Number(parseAmount(slippage, 2)),
          first_base_amount: parseAmount(first_base_amount, base_token == null ? void 0 : base_token.decimals),
          first_quote_amount: parseAmount(first_quote_amount, quote_token == null ? void 0 : quote_token.decimals),
          last_base_amount: parseAmount(last_base_amount, base_token == null ? void 0 : base_token.decimals),
          last_quote_amount: parseAmount(last_quote_amount, quote_token == null ? void 0 : quote_token.decimals),
          entry_price: parseAmount(entry_price, BOT_PRICE_DECIMALS),
          name: type === "swing" ? `[${type}]${name}` : name,
          pair_id,
          fill_base_or_quote,
          grid_buy_count,
          grid_sell_count,
          recommender
        };
        const baseTokenBotRegisterTransaction = yield this.getTokenBotRegisterTransaction(
          base_token.code,
          total_base_investment
        );
        const quoteTokenBotRegisterTransaction = yield this.getTokenBotRegisterTransaction(
          quote_token.code,
          total_quote_investment
        );
        const baseTokenTransferTransaction = yield this.getTokenTransferTransaction(
          base_token.code,
          total_base_investment
        );
        const quoteTokenTransferTransaction = yield this.getTokenTransferTransaction(
          quote_token.code,
          total_quote_investment
        );
        const botStorageFee = this.queryBotStorageFee(grid_buy_count + grid_sell_count);
        const createBotDeposit = new Big2(botStorageFee).plus(
          base_token.symbol === "NEAR" ? total_base_investment : quote_token.symbol === "NEAR" ? total_quote_investment : 0
        ).toString();
        const createBotTransactionAction = {
          contractId: getConfigs().nearGridContract,
          actions: [
            {
              method: "create_bot",
              args: formattedParams,
              deposit: parseAmount(createBotDeposit, NEAR_DECIMALS),
              gas: parseAmount(300, NEAR_TGAS_DECIMALS)
            }
          ]
        };
        const transactions = [
          baseTokenBotRegisterTransaction,
          quoteTokenBotRegisterTransaction,
          baseTokenTransferTransaction,
          quoteTokenTransferTransaction,
          createBotTransactionAction
        ].filter(Boolean);
        return nearContractServices.transformTransactionActions(transactions);
      } catch (error) {
        return Promise.reject(error);
      }
    });
  },
  createDCABot(params) {
    return __async(this, null, function* () {
      try {
        const {
          base_token,
          quote_token,
          token_in,
          token_out,
          single_amount_in,
          start_time,
          interval_time,
          count,
          lowest_price,
          highest_price,
          slippage,
          total_base_investment,
          total_quote_investment,
          name,
          recommender
        } = params;
        const tokenInMeta = getTokenByAddress(token_in);
        const formattedParams = {
          token_in,
          token_out,
          single_amount_in: parseAmount(single_amount_in, tokenInMeta == null ? void 0 : tokenInMeta.decimals),
          start_time: start_time && dayjs_default(start_time).isAfter(dayjs_default().add(10, "minute")) ? dayjs_default(start_time).valueOf() : dayjs_default().add(10, "minute").valueOf(),
          interval_time,
          count: Number(count),
          lowest_price: Number(parseAmount(lowest_price, DCA_PRICE_DECIMALS)),
          highest_price: Number(parseAmount(highest_price, DCA_PRICE_DECIMALS)),
          slippage: Number(parseAmount(slippage, 2)),
          name,
          recommender
        };
        const baseTokenRegisterTransaction = yield this.getTokenBotRegisterTransaction(
          base_token.code,
          total_base_investment,
          getConfigs().nearDCAContract
        );
        const quoteTokenBotRegisterTransaction = yield this.getTokenBotRegisterTransaction(
          quote_token.code,
          total_quote_investment,
          getConfigs().nearDCAContract
        );
        const baseTokenTransferTransaction = yield this.getTokenTransferTransaction(
          base_token.code,
          total_base_investment,
          getConfigs().nearDCAContract
        );
        const quoteTokenTransferTransaction = yield this.getTokenTransferTransaction(
          quote_token.code,
          total_quote_investment,
          getConfigs().nearDCAContract
        );
        const createBotDeposit = "0.01";
        const createBotTransactionAction = {
          contractId: getConfigs().nearDCAContract,
          actions: [
            {
              method: "create_dca",
              args: formattedParams,
              deposit: parseAmount(createBotDeposit, NEAR_DECIMALS),
              gas: parseAmount(300, NEAR_TGAS_DECIMALS)
            }
          ]
        };
        const transactions = [
          baseTokenRegisterTransaction,
          quoteTokenBotRegisterTransaction,
          baseTokenTransferTransaction,
          quoteTokenTransferTransaction,
          createBotTransactionAction
        ].filter(Boolean);
        return nearContractServices.transformTransactionActions(transactions);
      } catch (error) {
        return Promise.reject(error);
      }
    });
  },
  getTokenBotRegisterTransaction(_0, _1) {
    return __async(this, arguments, function* (tokenAddress, totalInvestment, contractId = getConfigs().nearGridContract) {
      if (new Big2(totalInvestment).eq(0)) return;
      const isRegistered = yield nearContractServices.query({
        contractId,
        method: "query_user_token_registered",
        args: { token: tokenAddress, user: globalState.get("accountId") }
      });
      if (!isRegistered) {
        return {
          contractId,
          actions: [
            {
              method: "token_storage_deposit",
              args: { token: tokenAddress, user: globalState.get("accountId") },
              deposit: parseAmount(0.02)
            }
          ]
        };
      }
    });
  },
  getTokenTransferTransaction(_0, _1) {
    return __async(this, arguments, function* (tokenAddress, totalInvestment, receiverId = getConfigs().nearGridContract) {
      const tokenMeta = getTokenByAddress(tokenAddress);
      if (!tokenMeta) return;
      if (receiverId === getConfigs().nearGridContract && tokenMeta.symbol === "NEAR") return;
      if (new Big2(totalInvestment).gt(0)) {
        return {
          contractId: tokenAddress,
          actions: [
            {
              method: "ft_transfer_call",
              args: {
                amount: parseAmount(totalInvestment, tokenMeta == null ? void 0 : tokenMeta.decimals),
                receiver_id: receiverId,
                msg: ""
              },
              deposit: "1"
            }
          ]
        };
      } else {
        const storageDepositTransaction = yield nearContractServices.registerToken(tokenAddress);
        return storageDepositTransaction;
      }
    });
  },
  queryBotStorageFee(gridCount) {
    return new Big2(0.02).plus(new Big2(4e-3).times(gridCount)).toString();
  },
  claimGridBot(id) {
    return __async(this, null, function* () {
      const transactions = [
        {
          contractId: getConfigs().nearGridContract,
          actions: [
            {
              method: "claim",
              args: { bot_id: "GRID:" + id },
              deposit: "1"
            }
          ]
        }
      ];
      return nearContractServices.transformTransactionActions(transactions);
    });
  },
  claimDCABot(id) {
    return __async(this, null, function* () {
      const transactions = [
        {
          contractId: getConfigs().nearDCAContract,
          actions: [
            {
              method: "claim",
              args: { vault_id: id },
              deposit: "1"
            }
          ]
        }
      ];
      return nearContractServices.transformTransactionActions(transactions);
    });
  },
  closeGridBot(bot_id) {
    return __async(this, null, function* () {
      const transactions = [
        {
          contractId: getConfigs().nearGridContract,
          actions: [
            {
              method: "close_bot",
              args: { bot_id: "GRID:" + bot_id.toString() },
              deposit: "1",
              gas: parseAmount(300, NEAR_TGAS_DECIMALS)
            }
          ]
        }
      ];
      return nearContractServices.transformTransactionActions(transactions);
    });
  },
  closeDCABot(dca_id) {
    return __async(this, null, function* () {
      const transactions = [
        {
          contractId: getConfigs().nearDCAContract,
          actions: [
            {
              method: "close_dca",
              args: { vault_id: dca_id },
              deposit: "1",
              gas: parseAmount(300, NEAR_TGAS_DECIMALS)
            }
          ]
        }
      ];
      return nearContractServices.transformTransactionActions(transactions);
    });
  },
  queryUserBalance(token, decimals) {
    return __async(this, null, function* () {
      var _a;
      const accountId = globalState.get("accountId");
      const [res1, res2] = yield Promise.all(
        [getConfigs().nearGridContract, getConfigs().nearDCAContract].map((contractId) => __async(this, null, function* () {
          return nearContractServices.query({
            contractId,
            method: "query_user_balance",
            args: { user: accountId, token }
          });
        }))
      );
      const total = new Big2(res1 || 0).plus(res2 || 0).toString();
      return formatAmount(total, decimals || ((_a = getTokenByAddress(token)) == null ? void 0 : _a.decimals));
    });
  },
  withdraw(token) {
    return __async(this, null, function* () {
      const accountId = globalState.get("accountId");
      const [res1, res2] = yield Promise.all(
        [getConfigs().nearGridContract, getConfigs().nearDCAContract].map((contractId) => __async(this, null, function* () {
          const amount = yield nearContractServices.query({
            contractId,
            method: "query_user_balance",
            args: { user: accountId, token }
          });
          return { contractId, amount };
        }))
      );
      const transactions = [res1, res2].filter((item) => new Big2(item.amount || 0).gt(0)).map((item) => ({
        contractId: item.contractId,
        actions: [
          {
            method: "withdraw",
            args: { token },
            deposit: "1"
          }
        ]
      }));
      return nearContractServices.transformTransactionActions(transactions);
    });
  }
};
var SOLANA_BOT_PRICE_DECIMALS = 10;
var botSolanaContractServices = {
  createProgram() {
    const connection = solanaContractServices.connect();
    const programId = new PublicKey2(getConfigs().solanaGridContract);
    const program = new anchor2.Program(IDL, programId, { connection });
    return program;
  },
  createGridBot(params) {
    return __async(this, null, function* () {
      var _a;
      const baseTokenDecimals = getTokenDecimals(params.base_token.symbol, "solana");
      const quoteTokenDecimals = getTokenDecimals(params.quote_token.symbol, "solana");
      const {
        name,
        slippage,
        grid_type,
        grid_rate,
        grid_offset,
        first_base_amount,
        first_quote_amount,
        last_base_amount,
        last_quote_amount,
        fill_base_or_quote,
        trigger_price,
        take_profit_price,
        stop_loss_price,
        valid_until_time,
        entry_price,
        base_token,
        quote_token,
        total_base_investment,
        total_quote_investment,
        grid_buy_count,
        grid_sell_count,
        recommender
      } = __spreadProps(__spreadValues({}, params), {
        grid_type: params.grid_type === "EqOffset" ? 0 : 1,
        grid_offset: new anchor2.BN(
          params.grid_type === "EqOffset" ? parseAmount(
            params.grid_offset,
            params.fill_base_or_quote ? quoteTokenDecimals : baseTokenDecimals
          ) : "0"
        ),
        grid_rate: (_a = params.grid_type === "EqRate" ? params.grid_rate : 0) != null ? _a : 0,
        trigger_price: new anchor2.BN(parseAmount(params.trigger_price, SOLANA_BOT_PRICE_DECIMALS)),
        take_profit_price: new anchor2.BN(
          parseAmount(params.take_profit_price, SOLANA_BOT_PRICE_DECIMALS)
        ),
        stop_loss_price: new anchor2.BN(
          parseAmount(params.stop_loss_price, SOLANA_BOT_PRICE_DECIMALS)
        ),
        valid_until_time: new anchor2.BN(params.valid_until_time || 0),
        slippage: Number(parseAmount(params.slippage, 2)),
        first_base_amount: new anchor2.BN(parseAmount(params.first_base_amount, baseTokenDecimals)),
        first_quote_amount: new anchor2.BN(parseAmount(params.first_quote_amount, quoteTokenDecimals)),
        last_base_amount: new anchor2.BN(parseAmount(params.last_base_amount, baseTokenDecimals)),
        last_quote_amount: new anchor2.BN(parseAmount(params.last_quote_amount, quoteTokenDecimals)),
        entry_price: new anchor2.BN(parseAmount(params.entry_price, SOLANA_BOT_PRICE_DECIMALS)),
        name: params.type === "swing" ? `[${params.type}]${params.name}` : params.name,
        fill_base_or_quote: params.fill_base_or_quote,
        total_base_investment: parseAmount(params.total_base_investment, baseTokenDecimals),
        total_quote_investment: parseAmount(params.total_quote_investment, quoteTokenDecimals)
      });
      const userPublicKey = new PublicKey2(globalState.get("accountId"));
      if (!userPublicKey) return Promise.reject("No user public key");
      const baseTokenPublicKey = new PublicKey2(getTokenAddress(base_token.symbol, "solana"));
      const quoteTokenPublicKey = new PublicKey2(getTokenAddress(quote_token.symbol, "solana"));
      const program = this.createProgram();
      const userStatePDA = this.getUserStatePDA(program, userPublicKey);
      const pairPDA = this.getPairAccountPDA(program, baseTokenPublicKey, quoteTokenPublicKey);
      const gridBotState = new PublicKey2(getConfigs().solanaGridBotState);
      const [
        baseGlobalBalanceInfo,
        quoteGlobalBalanceInfo,
        baseDepositLimitAccountPDA,
        quoteDepositLimitAccountPDA,
        { nextUserBotId }
      ] = yield Promise.all([
        this.getGlobalBalanceInfo(program, baseTokenPublicKey),
        this.getGlobalBalanceInfo(program, quoteTokenPublicKey),
        this.getDepositLimitAccountPDA(program, baseTokenPublicKey),
        this.getDepositLimitAccountPDA(program, quoteTokenPublicKey),
        this.getNextBotId(program, userPublicKey)
      ]);
      const gridBotPDA = this.getGridBotAccountPDA(program, userPublicKey, nextUserBotId);
      const [userBaseTokenAccount, userQuoteTokenAccount] = yield Promise.all([
        getAssociatedTokenAddress2(baseTokenPublicKey, userPublicKey),
        getAssociatedTokenAddress2(quoteTokenPublicKey, userPublicKey)
      ]);
      const [referralRecordPDA] = solanaContractServices.findProgramAddressSync(
        [
          Buffer.from("referral_record"),
          new PublicKey2(getConfigs().solanaGridBotState).toBuffer(),
          userPublicKey.toBuffer()
        ],
        program.programId
      );
      const createBotInstruction = program.methods.createBot(
        name,
        grid_type,
        grid_rate,
        grid_offset,
        first_base_amount,
        first_quote_amount,
        last_base_amount,
        last_quote_amount,
        fill_base_or_quote,
        valid_until_time,
        entry_price,
        recommender ? new PublicKey2(recommender) : null
      ).accounts({
        gridBotState,
        userState: userStatePDA,
        baseMint: baseTokenPublicKey,
        quoteMint: quoteTokenPublicKey,
        pair: pairPDA,
        gridBot: gridBotPDA,
        globalBalanceBaseUser: baseGlobalBalanceInfo.user,
        globalBalanceBase: baseGlobalBalanceInfo.tokenAccount,
        globalBalanceQuoteUser: quoteGlobalBalanceInfo.user,
        globalBalanceQuote: quoteGlobalBalanceInfo.tokenAccount,
        depositLimitBase: baseDepositLimitAccountPDA,
        depositLimitQuote: quoteDepositLimitAccountPDA,
        userBaseTokenAccount,
        userQuoteTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID2,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID2,
        referralRecord: referralRecordPDA,
        user: userPublicKey,
        systemProgram: anchor2.web3.SystemProgram.programId
      }).instruction();
      const [
        baseTokenWrapOrCreateTransaction,
        quoteTokenWrapOrCreateTransaction,
        createBotAccountTransaction,
        createBotTransaction
      ] = yield Promise.all([
        base_token.symbol === "SOL" ? solanaContractServices.convertSOL("wrap", BigInt(total_base_investment)) : solanaContractServices.createAssociatedTokenAccount(baseTokenPublicKey, userPublicKey),
        quote_token.symbol === "SOL" ? solanaContractServices.convertSOL("wrap", BigInt(total_quote_investment)) : solanaContractServices.createAssociatedTokenAccount(quoteTokenPublicKey, userPublicKey),
        this.getCreateBotAccountTransaction(program, userPublicKey, grid_sell_count, grid_buy_count),
        createBotInstruction
      ]);
      const transactions = [
        baseTokenWrapOrCreateTransaction == null ? void 0 : baseTokenWrapOrCreateTransaction.transaction,
        quoteTokenWrapOrCreateTransaction == null ? void 0 : quoteTokenWrapOrCreateTransaction.transaction,
        createBotAccountTransaction,
        createBotTransaction
      ].filter(Boolean);
      return transactions;
    });
  },
  createDCABot(params) {
    return __async(this, null, function* () {
      throw Error("Not implemented");
    });
  },
  claimGridBot(id) {
    return __async(this, null, function* () {
      const { userStateId } = this.transformIds(id);
      const userPublicKey = new PublicKey2(globalState.get("accountId"));
      if (!userPublicKey) return Promise.reject("No user public key");
      const bot = yield botServices.queryDetail("grid", id);
      if (!bot) return Promise.reject("No bot found");
      const program = this.createProgram();
      const gridBotPDA = this.getGridBotAccountPDA(program, userPublicKey, userStateId);
      const baseTokenPublicKey = new PublicKey2(bot == null ? void 0 : bot.base_token.code);
      const quoteTokenPublicKey = new PublicKey2(bot == null ? void 0 : bot.quote_token.code);
      const gridBotState = new PublicKey2(getConfigs().solanaGridBotState);
      const pairPDA = this.getPairAccountPDA(program, baseTokenPublicKey, quoteTokenPublicKey);
      const [
        baseGlobalBalanceInfo,
        quoteGlobalBalanceInfo,
        userBaseTokenAccount,
        userQuoteTokenAccount
      ] = yield Promise.all([
        this.getGlobalBalanceInfo(program, baseTokenPublicKey),
        this.getGlobalBalanceInfo(program, quoteTokenPublicKey),
        getAssociatedTokenAddress2(baseTokenPublicKey, userPublicKey),
        getAssociatedTokenAddress2(quoteTokenPublicKey, userPublicKey)
      ]);
      const [baseCreateAccountTransaction, quoteCreateAccountTransaction, claimBotTransaction] = yield Promise.all([
        solanaContractServices.createAssociatedTokenAccount(baseTokenPublicKey, userPublicKey),
        solanaContractServices.createAssociatedTokenAccount(quoteTokenPublicKey, userPublicKey),
        program.methods.claim({
          userStateId,
          globalBaseBump: baseGlobalBalanceInfo.bump,
          globalQuoteBump: quoteGlobalBalanceInfo.bump
        }).accounts({
          gridBotState,
          pair: pairPDA,
          gridBot: gridBotPDA,
          globalBalanceBaseUser: baseGlobalBalanceInfo.user,
          globalBalanceBase: baseGlobalBalanceInfo.tokenAccount,
          globalBalanceQuoteUser: quoteGlobalBalanceInfo.user,
          globalBalanceQuote: quoteGlobalBalanceInfo.tokenAccount,
          user: userPublicKey,
          tokenProgram: TOKEN_PROGRAM_ID2,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID2,
          systemProgram: anchor2.web3.SystemProgram.programId,
          userBaseTokenAccount,
          userQuoteTokenAccount,
          baseMint: baseTokenPublicKey,
          quoteMint: quoteTokenPublicKey
        }).instruction()
      ]);
      const transactions = [
        baseCreateAccountTransaction == null ? void 0 : baseCreateAccountTransaction.transaction,
        quoteCreateAccountTransaction == null ? void 0 : quoteCreateAccountTransaction.transaction,
        claimBotTransaction
      ].filter(Boolean);
      return transactions;
    });
  },
  claimDCABot(id) {
    return __async(this, null, function* () {
      return Promise.reject("Not implemented");
    });
  },
  closeGridBot(id) {
    return __async(this, null, function* () {
      var _a, _b;
      const { userStateId } = this.transformIds(id);
      const userPublicKey = new PublicKey2(globalState.get("accountId"));
      if (!userPublicKey) return Promise.reject("No user public key");
      const program = this.createProgram();
      const gridBotPDA = this.getGridBotAccountPDA(program, userPublicKey, userStateId);
      const botInfo = yield program.account.gridBot.fetch(gridBotPDA);
      if (!botInfo) return Promise.reject("No bot found");
      const [baseToken, quoteToken] = botInfo.pairId.split(":");
      const baseTokenPublicKey = new PublicKey2(baseToken);
      const quoteTokenPublicKey = new PublicKey2(quoteToken);
      const gridBotState = new PublicKey2(getConfigs().solanaGridBotState);
      const pairPDA = this.getPairAccountPDA(program, baseTokenPublicKey, quoteTokenPublicKey);
      const [
        baseGlobalBalanceInfo,
        quoteGlobalBalanceInfo,
        userBaseTokenAccount,
        userQuoteTokenAccount
      ] = yield Promise.all([
        this.getGlobalBalanceInfo(program, baseTokenPublicKey),
        this.getGlobalBalanceInfo(program, quoteTokenPublicKey),
        getAssociatedTokenAddress2(baseTokenPublicKey, userPublicKey),
        getAssociatedTokenAddress2(quoteTokenPublicKey, userPublicKey)
      ]);
      const [
        baseCreateAccountTransaction,
        quoteCreateAccountTransaction,
        closeBotTransaction,
        unwrapBaseTransaction,
        unwrapQuoteTransaction
      ] = yield Promise.all([
        solanaContractServices.createAssociatedTokenAccount(baseTokenPublicKey, userPublicKey),
        solanaContractServices.createAssociatedTokenAccount(quoteTokenPublicKey, userPublicKey),
        program.methods.closeBot({
          userStateId,
          globalBaseBump: baseGlobalBalanceInfo.bump,
          globalQuoteBump: quoteGlobalBalanceInfo.bump
        }).accounts({
          gridBotState,
          pair: pairPDA,
          gridBot: gridBotPDA,
          globalBalanceBaseUser: baseGlobalBalanceInfo.user,
          globalBalanceBase: baseGlobalBalanceInfo.tokenAccount,
          globalBalanceQuoteUser: quoteGlobalBalanceInfo.user,
          globalBalanceQuote: quoteGlobalBalanceInfo.tokenAccount,
          user: userPublicKey,
          tokenProgram: TOKEN_PROGRAM_ID2,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID2,
          systemProgram: anchor2.web3.SystemProgram.programId,
          baseMint: baseTokenPublicKey,
          quoteMint: quoteTokenPublicKey,
          userBaseTokenAccount,
          userQuoteTokenAccount
        }).instruction(),
        ((_a = getTokenByAddress(baseToken)) == null ? void 0 : _a.symbol) === "SOL" ? solanaContractServices.convertSOL("unwrap", BigInt(botInfo.totalBaseAmount.toNumber())) : void 0,
        ((_b = getTokenByAddress(quoteToken)) == null ? void 0 : _b.symbol) === "SOL" ? solanaContractServices.convertSOL("unwrap", BigInt(botInfo.totalQuoteAmount.toNumber())) : void 0
      ]);
      const transactions = [
        baseCreateAccountTransaction == null ? void 0 : baseCreateAccountTransaction.transaction,
        quoteCreateAccountTransaction == null ? void 0 : quoteCreateAccountTransaction.transaction,
        closeBotTransaction,
        unwrapBaseTransaction == null ? void 0 : unwrapBaseTransaction.transaction,
        unwrapQuoteTransaction == null ? void 0 : unwrapQuoteTransaction.transaction
      ].filter(Boolean);
      return transactions;
    });
  },
  closeDCABot(dca_id) {
    return __async(this, null, function* () {
      return Promise.reject("Not implemented");
    });
  },
  queryUserBalance(token, decimals) {
    return __async(this, null, function* () {
      return;
    });
  },
  withdraw(token) {
    return __async(this, null, function* () {
      return;
    });
  },
  queryBotStorageFee(gridCount) {
    return "0";
  },
  queryMinDeposit(botType, token) {
    return __async(this, null, function* () {
      return SOLANA_MIN_DEPOSIT[token.symbol];
    });
  },
  transformIds(id) {
    const res = String(id).match(/^(\d+)(\d{9})$/);
    if (!res) throw new Error("Invalid bot id");
    return {
      botId: Number(res[1]),
      userStateId: Number(res[2])
    };
  },
  getCreateBotAccountTransaction(program, user, grid_sell_count, grid_buy_count) {
    return __async(this, null, function* () {
      const { nextUserBotId } = yield this.getNextBotId(program, user);
      const gridBotState = new PublicKey2(getConfigs().solanaGridBotState);
      const userStatePDA = this.getUserStatePDA(program, user);
      const gridBot = this.getGridBotAccountPDA(program, user, nextUserBotId);
      const res = yield program.methods.createBotAccount(grid_sell_count, grid_buy_count).accounts({
        gridBotState,
        userState: userStatePDA,
        gridBot,
        user,
        systemProgram: anchor2.web3.SystemProgram.programId
      }).instruction();
      return res;
    });
  },
  getPairAccountPDA(program, baseToken, quoteToken) {
    const [pda] = solanaContractServices.findProgramAddressSync(
      [
        new PublicKey2(getConfigs().solanaGridBotState).toBuffer(),
        baseToken.toBuffer(),
        quoteToken.toBuffer()
      ],
      program.programId
    );
    return pda;
  },
  getUserStatePDA(program, user) {
    const [pda] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from("user_state"),
        new PublicKey2(getConfigs().solanaGridBotState).toBuffer(),
        user.toBuffer()
      ],
      program.programId
    );
    return pda;
  },
  getNextBotId(program, user) {
    return __async(this, null, function* () {
      let nextUserBotId = 0;
      const userStatePDA = this.getUserStatePDA(program, user);
      try {
        const accountInfo = yield program.account.userState.fetch(userStatePDA);
        if (accountInfo) {
          nextUserBotId = accountInfo.nextUserBotId;
          return { nextUserBotId, exists: true };
        }
      } catch (error) {
      }
      return { nextUserBotId, exists: false };
    });
  },
  getGridBotAccountPDA(program, user, nextUserBotId) {
    const nextUserBotIdBuffer = Buffer.alloc(4);
    nextUserBotIdBuffer.writeUInt32BE(nextUserBotId);
    const [pda] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from("user_grid_bot"),
        new PublicKey2(getConfigs().solanaGridBotState).toBuffer(),
        user.toBuffer(),
        nextUserBotIdBuffer
      ],
      program.programId
    );
    return pda;
  },
  getGlobalBalanceInfo(program, token) {
    return __async(this, null, function* () {
      const [globalBalUserPDA, globalBalUserBump] = solanaContractServices.findProgramAddressSync(
        [
          Buffer.from("global_balance_user"),
          new PublicKey2(getConfigs().solanaGridBotState).toBuffer(),
          token.toBuffer()
        ],
        program.programId
      );
      const globalBalTokenAccount = yield getAssociatedTokenAddress2(
        token,
        globalBalUserPDA,
        true,
        TOKEN_PROGRAM_ID2,
        ASSOCIATED_TOKEN_PROGRAM_ID2
      );
      return {
        user: globalBalUserPDA,
        bump: globalBalUserBump,
        tokenAccount: globalBalTokenAccount
      };
    });
  },
  getDepositLimitAccountPDA(program, token) {
    const [pda, bump] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from("deposit_limit"),
        new PublicKey2(getConfigs().solanaGridBotState).toBuffer(),
        token.toBuffer()
      ],
      program.programId
    );
    return pda;
  }
};

// src/services/bot/index.ts
var botServices = {
  querySummary() {
    return __async(this, null, function* () {
      const accountId = globalState.get("accountId");
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/user/bot/summary"), {
          account_id: accountId
        })
      );
      return data;
    });
  },
  query(type, params) {
    return __async(this, null, function* () {
      switch (type) {
        case "dca":
          return dcaBotServices.query(params);
        default:
          return gridBotServices.query(params);
      }
    });
  },
  queryDetail(type, bot_id, chain) {
    return __async(this, null, function* () {
      switch (type) {
        case "dca":
          return dcaBotServices.queryDetail(bot_id, type, chain);
        default:
          return gridBotServices.queryDetail(bot_id, type, chain);
      }
    });
  }
};
var gridBotServices = {
  query(params) {
    return __async(this, null, function* () {
      var _b;
      try {
        if (!params.account_id) return { list: [], has_next_page: false };
        const _a = params, { page = 1, pageSize: limit = 10, status } = _a, rest = __objRest(_a, ["page", "pageSize", "status"]);
        const offset = (page - 1) * limit;
        let transformedStatus = void 0;
        if (typeof status === "string") {
          transformedStatus = status === "position" ? "active,expired" : "closed";
        }
        const transformedParams = this.transformQueryBotParams(__spreadValues({
          limit,
          offset,
          status: transformedStatus
        }, rest));
        const { data } = yield request(
          generateUrl(botInnerApiPrefix("/bots"), transformedParams)
        );
        if ((_b = data == null ? void 0 : data.list) == null ? void 0 : _b.length) {
          data.list = data.list.map((item, index) => __spreadProps(__spreadValues({}, this.transformData(item)), {
            index: index + limit * (page - 1) + 1
          }));
        }
        return data;
      } catch (error) {
        return { list: [], has_next_page: false };
      }
    });
  },
  queryDetail(bot_id, type, chain) {
    return __async(this, null, function* () {
      const _type = type === "swing" ? "grid" : type;
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/bot", chain != null ? chain : globalState.get("chain")), {
          bot_id,
          type: _type
        })
      );
      return data ? this.transformData(data, chain) : void 0;
    });
  },
  queryDetailLogs(params) {
    return __async(this, null, function* () {
      const _a = params, { recordType } = _a, rest = __objRest(_a, ["recordType"]);
      switch (recordType) {
        case "orders":
          return gridBotServices.queryOrders(rest);
        case "trades":
          return gridBotServices.queryTrades(rest);
        case "claims":
          return gridBotServices.queryClaims(rest);
      }
    });
  },
  queryOrders(params) {
    return __async(this, null, function* () {
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/bot/grid/orders"), params)
      );
      data == null ? void 0 : data.sort((a, b) => Number(b.price) - Number(a.price));
      const list = data == null ? void 0 : data.reduce((acc, item) => {
        const rawAmount = item.is_buy ? new Big3(item.buy_token.volume).minus(item.buy_filled_volume).toString() : new Big3(item.sell_token.volume).minus(item.sell_filled_volume).toString();
        if (new Big3(rawAmount).lte(100)) return acc;
        const amount = formatAmount(
          rawAmount,
          item.is_buy ? item.buy_token.decimals : item.sell_token.decimals
        );
        const total = new Big3(item.price).times(amount).toString();
        acc.push(__spreadProps(__spreadValues({}, item), { amount, total, index: acc.length + 1 }));
        return acc;
      }, []);
      return { list, has_next_page: false };
    });
  },
  queryTrades(params) {
    return __async(this, null, function* () {
      var _a;
      const { bot_id, page = 1, pageSize: limit = 10 } = params;
      const offset = (page - 1) * limit;
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/bot/grid/trades"), {
          bot_id,
          limit,
          offset
        })
      );
      (_a = data == null ? void 0 : data.list) == null ? void 0 : _a.forEach((item, index) => item.index = index + limit * (page - 1) + 1);
      return data;
    });
  },
  queryClaims(params) {
    return __async(this, null, function* () {
      var _a;
      const { bot_id, page = 1, pageSize: limit = 10 } = params;
      const offset = (page - 1) * limit;
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/bot/grid/claims"), {
          bot_id,
          limit,
          offset
        })
      );
      (_a = data == null ? void 0 : data.list) == null ? void 0 : _a.forEach((item, index) => item.index = index + limit * (page - 1) + 1);
      return data;
    });
  },
  transformData(data, chain) {
    var _a;
    if ("type" in data && (data == null ? void 0 : data.type) === "grid") {
      data.type = data.grid_style || data.type;
    } else if ("bot_type" in data && data.bot_type === "grid") {
      data.bot_type = data.bot_grid_style || data.bot_type;
    }
    data.chain = ((_a = data.chain) == null ? void 0 : _a.toLowerCase()) || chain || globalState.get("chain");
    if ("base_order_price" in data || "quote_order_price" in data) {
      const base = "base_token" in data ? data.base_token : data.investment_base;
      const quote = "quote_token" in data ? data.quote_token : data.investment_quote;
      const baseAmount = formatAmount(base.volume, base.decimals);
      const quoteAmount = formatAmount(quote.volume, quote.decimals);
      data.totalInvestmentUsd = new Big3(baseAmount).times(data.base_order_price || 0).plus(new Big3(quoteAmount).times(data.quote_order_price || 0)).toString();
    }
    return data;
  },
  transformQueryBotParams(data) {
    const newData = __spreadValues({}, data);
    if ((data == null ? void 0 : data.bot_type) && ["grid", "swing"].includes(data == null ? void 0 : data.bot_type)) {
      newData.bot_type = "grid";
      newData.grid_style = data.bot_type;
    }
    return newData;
  }
};
var dcaBotServices = {
  query(params, all) {
    return __async(this, null, function* () {
      var _b;
      try {
        if (!all && !params.account_id) return { list: [], has_next_page: false };
        const _a = params, { page = 1, pageSize: limit = 10, status, dir: sort, order_by } = _a, rest = __objRest(_a, ["page", "pageSize", "status", "dir", "order_by"]);
        const offset = (page - 1) * limit;
        let closed = -1;
        if (status) {
          if (["position", "active"].includes(status)) {
            closed = 0;
          }
          if (["history", "closed"].includes(status)) {
            closed = 1;
          }
        }
        const { data } = yield request(
          generateUrl(botInnerApiPrefix("/dca/list"), __spreadValues({
            limit,
            offset,
            closed,
            order_by: order_by === "bot_create_time" ? "time" : order_by,
            sort
          }, rest))
        );
        if ((_b = data == null ? void 0 : data.list) == null ? void 0 : _b.length) {
          data.list = data.list.map((item, index) => __spreadProps(__spreadValues({}, this.transformData(item)), {
            index: index + limit * (page - 1) + 1
          }));
        }
        return data;
      } catch (error) {
        return { list: [], has_next_page: false };
      }
    });
  },
  queryDetail(bot_id, type = "dca", chain) {
    return __async(this, null, function* () {
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/dca/details", chain != null ? chain : globalState.get("chain")), {
          dca_id: bot_id
        })
      );
      return data ? this.transformData(data) : void 0;
    });
  },
  queryDetailLogs(params) {
    return __async(this, null, function* () {
      const _a = params, { recordType } = _a, rest = __objRest(_a, ["recordType"]);
      switch (recordType) {
        case "orders":
          return dcaBotServices.queryOrders(rest);
        case "trades":
          return dcaBotServices.queryTrades(rest);
        case "claims":
          return dcaBotServices.queryClaims(rest);
      }
    });
  },
  queryOrders(params) {
    return __async(this, null, function* () {
      var _a;
      const bot = yield this.queryDetail(params.id);
      if (bot) {
        const list = [];
        for (let i = bot.execute_count; i < bot.count; i++) {
          const order = {
            index: i - bot.execute_count + 1,
            tradeType: bot.tradeType,
            amount: formatAmount(bot.single_amount_in, (_a = bot.tokenIn) == null ? void 0 : _a.decimals),
            time: dayjs_default(bot.start_time).add(i * Number(bot.interval_time), "ms").valueOf()
          };
          list.push(order);
        }
        return { list, has_next_page: false };
      }
      return { list: [], has_next_page: false };
    });
  },
  queryTrades(params) {
    return __async(this, null, function* () {
      const bot = yield this.queryDetail(params.id);
      if (!bot) return { list: [] };
      const { page = 1, pageSize: limit = 10, id: dca_id } = params;
      const offset = (page - 1) * limit;
      const { data } = yield request(generateUrl(botInnerApiPrefix("/dca/trades"), { dca_id, limit, offset }));
      const list = ((data == null ? void 0 : data.list) || []).map((item, index) => {
        var _a, _b;
        const amountIn = formatAmount(bot.single_amount_in, (_a = bot.tokenIn) == null ? void 0 : _a.decimals);
        const amountOut = formatAmount(item.volume, (_b = bot.tokenOut) == null ? void 0 : _b.decimals);
        const amount = bot.tradeType === "buy" ? amountOut : amountIn;
        const price = bot.tradeType === "buy" ? new Big3(amountIn).div(amountOut).toString() : new Big3(amountOut).div(amountIn).toString();
        const total = new Big3(amount).times(price).round(12).toString();
        return __spreadProps(__spreadValues({}, item), { price, total, amount, index: index + limit * (page - 1) + 1 });
      });
      return __spreadProps(__spreadValues({}, data), { list });
    });
  },
  queryClaims(params) {
    return __async(this, null, function* () {
      var _a;
      const { page = 1, pageSize: limit = 10, id: dca_id } = params;
      const offset = (page - 1) * limit;
      const { data } = yield request(generateUrl(botInnerApiPrefix("/dca/claims"), { dca_id, limit, offset }));
      (_a = data == null ? void 0 : data.list) == null ? void 0 : _a.forEach((item, index) => {
        item.index = index + limit * (page - 1) + 1;
      });
      return data;
    });
  },
  queryMarketData(pair_id) {
    return __async(this, null, function* () {
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/dca/statistical"), { pair_id })
      );
      const groupData = data == null ? void 0 : data.reduce(
        (acc, item) => {
          acc[`${item.side}_${item.type}`] = item;
          return acc;
        },
        {}
      );
      return groupData;
    });
  },
  transformData(bot) {
    const data = __spreadValues({}, bot);
    const [base, quote] = data.pair_id.split(":");
    const lowestPrice = formatAmount(data.lowest_price, DCA_PRICE_DECIMALS);
    const highestPrice = formatAmount(data.highest_price, DCA_PRICE_DECIMALS);
    const baseToken = getTokenByAddress(base);
    const quoteToken = getTokenByAddress(quote);
    const tokenInMeta = getTokenByAddress(data.token_in);
    const tokenOutMeta = getTokenByAddress(data.token_out);
    data.id = data.dca_id;
    data.bot_id = data.dca_id;
    data.type = "dca";
    data.status = data.closed ? "closed" : "active";
    data.tradeType = data.side;
    data.bot_create_time = data.dca_create_time;
    data.frequency = formatDurationHumanize(data.interval_time);
    data.baseToken = baseToken;
    data.quoteToken = quoteToken;
    data.tokenIn = tokenInMeta;
    data.tokenOut = tokenOutMeta;
    data.lowest_price = data.side === "sell" ? lowestPrice : new Big3(highestPrice || 0).gt(0) ? parseDisplayPrice(new Big3(1).div(highestPrice).toString(), (baseToken == null ? void 0 : baseToken.symbol) || "") : "0";
    data.highest_price = data.side === "sell" ? highestPrice : new Big3(lowestPrice || 0).gt(0) ? parseDisplayPrice(new Big3(1).div(lowestPrice).toString(), (baseToken == null ? void 0 : baseToken.symbol) || "") : "0";
    data.investmentAmount = formatAmount(
      new Big3(data.single_amount_in).times(data.count).toString(),
      tokenInMeta == null ? void 0 : tokenInMeta.decimals
    );
    data.filledAmount = new Big3(data.investmentAmount).minus(formatAmount(data.left_amount_in, tokenInMeta == null ? void 0 : tokenInMeta.decimals)).toString();
    data.filledPercent = new Big3(data.filledAmount).div(data.investmentAmount).times(100).toString();
    data.endTime = dayjs_default(data.start_time).add(data.interval_time * (data.count - 1), "ms").valueOf();
    return data;
  }
};
var marketServices = {
  querySummary() {
    return __async(this, null, function* () {
      const { data } = yield request(botInnerApiPrefix("/market"));
      const { data: volumeData } = yield request(botInnerApiPrefix("/home/data"));
      return __spreadProps(__spreadValues({}, data), { volume_total: volumeData == null ? void 0 : volumeData.total, volume_24h: volumeData == null ? void 0 : volumeData.total_24h });
    });
  },
  queryBotCategories() {
    return __async(this, null, function* () {
      const { data } = yield request(
        botInnerApiPrefix("/market/bots")
      );
      return data == null ? void 0 : data.filter((item) => !(globalState.get("chain") === "solana" && item.type === "dca"));
    });
  },
  queryTopBots(params) {
    return __async(this, null, function* () {
      const { data } = yield request(
        generateUrl(botInnerApiPrefix("/market/bots/top24"), __spreadProps(__spreadValues({}, params), {
          chain: globalState.get("chain")
        }))
      );
      if (params == null ? void 0 : params.pair_id) {
        return data == null ? void 0 : data.filter((item) => item.pair_id === params.pair_id);
      }
      return data == null ? void 0 : data.map((v) => gridBotServices.transformData(v));
    });
  },
  queryAllBots(params) {
    return __async(this, null, function* () {
      var _b;
      if ((params == null ? void 0 : params.bot_type) === "dca") {
        return dcaBotServices.query(params, true);
      }
      const _a = params || {}, {
        bot_type,
        order_by = "bot_create_time",
        dir = "desc",
        page = 1,
        pageSize: limit = 10
      } = _a, rest = __objRest(_a, [
        "bot_type",
        "order_by",
        "dir",
        "page",
        "pageSize"
      ]);
      const offset = (page - 1) * limit;
      const transformedParams = gridBotServices.transformQueryBotParams(__spreadValues({
        bot_type,
        limit,
        offset,
        order_by,
        dir
      }, rest));
      const { data } = yield request(
        generateUrl(
          botInnerApiPrefix((params == null ? void 0 : params.account_id) ? "/bots" : "/market/bots/all"),
          transformedParams
        )
      );
      if ((_b = data == null ? void 0 : data.list) == null ? void 0 : _b.length) {
        data.list = data.list.map((item, index) => __spreadProps(__spreadValues({}, gridBotServices.transformData(item)), {
          index: index + limit * (page - 1) + 1
        }));
      }
      return data;
    });
  }
};

// src/lib/vaultList.ts
function getMyGridVaults(params) {
  return __async(this, null, function* () {
    const res = yield botServices.query("grid", transformMyVaultListParams(params));
    return res;
  });
}
function getMySwingVaults(params) {
  return __async(this, null, function* () {
    const res = yield botServices.query("swing", transformMyVaultListParams(params));
    return res;
  });
}
function getMyDCAVaults(params) {
  return __async(this, null, function* () {
    const res = yield botServices.query("dca", transformMyVaultListParams(params));
    return res;
  });
}
function transformMyVaultListParams(params) {
  const { orderBy, dir, pairId, status, page, pageSize } = params;
  return {
    account_id: globalState.get("accountId"),
    status,
    pair_id: pairId,
    order_by: orderBy,
    dir,
    page,
    pageSize
  };
}
function getMarketGridVaults(params) {
  return __async(this, null, function* () {
    const res = yield marketServices.queryAllBots(__spreadValues({
      bot_type: "grid"
    }, transformMarketVaultListParams(params)));
    return res || {};
  });
}
function getMarketSwingVaults(params) {
  return __async(this, null, function* () {
    const res = yield marketServices.queryAllBots(__spreadValues({
      bot_type: "swing"
    }, transformMarketVaultListParams(params)));
    return res || {};
  });
}
function getMarketDCAVaults(params) {
  return __async(this, null, function* () {
    const res = yield marketServices.queryAllBots(__spreadValues({
      bot_type: "dca"
    }, transformMarketVaultListParams(params)));
    return res || {};
  });
}
function transformMarketVaultListParams(params) {
  const { orderBy, dir, pairId, accountId, page, pageSize } = params;
  return {
    order_by: orderBy,
    dir,
    pair_id: pairId,
    account_id: accountId,
    page,
    pageSize
  };
}

// src/lib/userAssets.ts
import Big4 from "big.js";
function getAccountAssets() {
  return __async(this, null, function* () {
    const tokens = yield fetchTokens();
    const balanceMap = yield fetchBalances(tokens);
    const internalBalanceMap = yield fetchInternalBalances(tokens);
    const priceMap = (yield pairServices.queryPrice()) || {};
    const totalBalancePrice = calculateTotalPrice(balanceMap, priceMap);
    const totalInternalBalancePrice = calculateTotalPrice(internalBalanceMap, priceMap);
    const totalPrice = new Big4(totalBalancePrice).plus(totalInternalBalancePrice).toString();
    return {
      tokens,
      balanceMap,
      totalBalancePrice,
      totalInternalBalancePrice,
      totalPrice
    };
  });
}
function withdrawAccountAsset(token) {
  return __async(this, null, function* () {
    const chain = globalState.get("chain");
    const trans = chain === "near" ? botNearContractServices.withdraw(token.code) : botSolanaContractServices.withdraw(token.code);
    return trans;
  });
}
function fetchTokens() {
  return __async(this, null, function* () {
    const res = yield pairServices.query();
    return (res == null ? void 0 : res.reduce((acc, cur) => {
      if (!acc.some((item) => item.code === cur.base_token.code)) acc.push(cur.base_token);
      if (!acc.some((item) => item.code === cur.quote_token.code)) acc.push(cur.quote_token);
      return acc;
    }, [])) || [];
  });
}
function fetchBalances(tokens) {
  return __async(this, null, function* () {
    const res = yield Promise.all(
      tokens.map((token) => __async(this, null, function* () {
        const balance = yield contractServices.getBalance(token.code);
        return { code: token.code, balance };
      }))
    );
    return res.reduce(
      (acc, cur) => {
        acc[cur.code] = cur.balance;
        return acc;
      },
      {}
    );
  });
}
function fetchInternalBalances(tokens) {
  return __async(this, null, function* () {
    const res = yield Promise.all(
      tokens.map((token) => __async(this, null, function* () {
        const balance = yield botContractServices.queryUserBalance(token.code, token.decimals);
        return { code: token.code, balance: balance || "0" };
      }))
    );
    return res.reduce(
      (acc, cur) => {
        acc[cur.code] = cur.balance;
        return acc;
      },
      {}
    );
  });
}
function calculateTotalPrice(balanceMap, priceMap) {
  return Object.entries(balanceMap).reduce((acc, [code, balance]) => {
    const price = priceMap[code] || 0;
    return new Big4(acc).plus(new Big4(balance || 0).times(price)).toString();
  }, "0");
}

// src/lib/market.ts
function getMarketInfo() {
  return __async(this, null, function* () {
    const res = yield marketServices.querySummary();
    return res;
  });
}

// src/lib/referral.ts
function generateReferralUrl() {
  return __async(this, null, function* () {
    const accountId = globalState.get("accountId");
    const chain = globalState.get("chain");
    const network = globalState.get("network");
    if (!accountId) throw new Error("Please set accountId before generating referral url");
    const host = network === "mainnet" ? "https://www.deltatrade.ai" : "https://dev.deltabot.vip/";
    return `${host}?ref=${accountId}&chain=${chain}`;
  });
}

// src/lib/vault/dca.ts
import Big5 from "big.js";

// src/lib/vault/index.ts
function validateAccountId() {
  if (!globalState.get("accountId"))
    throw new Error("Please set accountId before creating a vault");
}
function getPair(pairId) {
  return __async(this, null, function* () {
    const pairs = yield pairServices.query();
    const pair = pairs.find((p) => p.pair_id === pairId);
    return pair;
  });
}
function getPairPrice(pairId) {
  return __async(this, null, function* () {
    const pairPriceRes = yield pairServices.queryPairPrice(pairId);
    const { pairPrice: entryPrice } = pairPriceRes[pairId] || {};
    return entryPrice;
  });
}
function getMinDeposit(pairId, type) {
  return __async(this, null, function* () {
    const pair = yield getPair(pairId);
    if (!pair) throw new Error("Pair not found");
    const minBaseDeposit = yield botContractServices.queryMinDeposit(type, pair.base_token);
    const minQuoteDeposit = yield botContractServices.queryMinDeposit(type, pair.quote_token);
    return { minBaseDeposit, minQuoteDeposit };
  });
}

// src/lib/vault/dca.ts
function validateDCAVaultParams(params) {
  return __async(this, null, function* () {
    validateAccountId();
    const errors = {};
    const pair = yield getPair(params.pairId);
    if (!pair) errors.pair = ["Pair not found"];
    if (!params.count) errors.count = ["Count is required"];
    if (!params.singleAmountIn) errors.singleAmountIn = ["Single amount in is required"];
    if (!params.startTime) errors.startTime = ["Start time is required"];
    if (!params.intervalTime) errors.intervalTime = ["Interval time is required"];
    if (params.slippage && (params.slippage < 0 || params.slippage > 100))
      errors.slippage = ["Slippage must be between 0 and 100"];
    if (params.lowestPrice && params.highestPrice && new Big5(params.lowestPrice).gt(params.highestPrice)) {
      errors.price = ["Lowest price must be less than highest price"];
    }
    const pairPrice = yield getPairPrice(params.pairId);
    if (params.lowestPrice && new Big5(params.lowestPrice).gt(pairPrice)) {
      errors.lowestPrice = ["Lowest price is greater than current price"];
    }
    if (params.highestPrice && new Big5(params.highestPrice).lt(pairPrice)) {
      errors.highestPrice = ["Highest price is less than current price"];
    }
    const minDeposit = yield getDCAMinDeposit(params);
    const tokenInSymbol = params.tradeType === "buy" ? pair == null ? void 0 : pair.base_token : pair == null ? void 0 : pair.quote_token;
    if (minDeposit && new Big5(params.singleAmountIn || 0).lt(minDeposit)) {
      errors.singleAmountIn = [
        `The initial investment cannot be less than ${formatNumber(minDeposit, {
          maximumFractionDigits: 6
        })} ${tokenInSymbol}`
      ];
    }
    if (Object.keys(errors).length > 0) {
      return errors;
    }
  });
}
function getDCAMinDeposit(params) {
  return __async(this, null, function* () {
    const { minBaseDeposit, minQuoteDeposit } = yield getMinDeposit(params.pairId, "dca");
    if (params.tradeType === "buy") return minQuoteDeposit;
    return minBaseDeposit;
  });
}
function getDCATotalInvestment(params) {
  return __async(this, null, function* () {
    const { tradeType, singleAmountIn, count } = params;
    if (!count || !singleAmountIn || !tradeType) return;
    const totalInvestment = new Big5(singleAmountIn).times(count).toString();
    const totalBaseInvestment = tradeType === "sell" ? totalInvestment : "0";
    const totalQuoteInvestment = tradeType === "buy" ? totalInvestment : "0";
    return {
      totalBaseInvestment,
      totalQuoteInvestment
    };
  });
}
function createDCAVault(params) {
  return __async(this, null, function* () {
    const errors = yield validateDCAVaultParams(params);
    if (errors) throw new Error(JSON.stringify(errors));
    const _params = yield transformDCAVaultParams(params);
    const chain = globalState.get("chain");
    const trans = yield chain === "near" ? botNearContractServices.createDCABot(_params) : botSolanaContractServices.createDCABot(_params);
    return trans;
  });
}
function claimDCAVault(params) {
  return __async(this, null, function* () {
    const chain = globalState.get("chain");
    const trans = chain === "near" ? botNearContractServices.claimDCABot(params.botId) : botSolanaContractServices.claimDCABot(params.botId);
    return trans;
  });
}
function closeDCAVault(params) {
  return __async(this, null, function* () {
    const chain = globalState.get("chain");
    const trans = chain === "near" ? botNearContractServices.closeDCABot(params.botId) : botSolanaContractServices.closeDCABot(params.botId);
    return trans;
  });
}
function transformDCAVaultParams(params) {
  return __async(this, null, function* () {
    const pair = yield getPair(params.pairId);
    if (!pair) throw new Error("Pair not found");
    const tokenIn = params.tradeType === "buy" ? pair.base_token : pair.quote_token;
    const tokenOut = params.tradeType === "buy" ? pair.quote_token : pair.base_token;
    const lowestPrice = params.tradeType === "buy" ? params.lowestPrice : params.highestPrice ? new Big5(1).div(params.highestPrice) : void 0;
    const highestPrice = params.tradeType === "buy" ? params.highestPrice : params.lowestPrice ? new Big5(1).div(params.lowestPrice) : void 0;
    const { totalBaseInvestment, totalQuoteInvestment } = (yield getDCATotalInvestment(params)) || {};
    const formattedParams = {
      name: params.name,
      token_in: tokenIn,
      token_out: tokenOut,
      single_amount_in: params.singleAmountIn,
      start_time: params.startTime,
      interval_time: params.intervalTime,
      count: params.count,
      lowest_price: lowestPrice,
      highest_price: highestPrice,
      slippage: params.slippage || 0.5,
      recommender: params.recommender || void 0,
      base_token: pair.base_token,
      quote_token: pair.quote_token,
      total_base_investment: totalBaseInvestment,
      total_quote_investment: totalQuoteInvestment
    };
    return __spreadValues({}, formattedParams);
  });
}

// src/lib/vault/grid.ts
import Big6 from "big.js";
function validateGridVaultParams(params) {
  return __async(this, null, function* () {
    validateAccountId();
    const errors = {};
    const pair = yield getPair(params.pairId);
    if (!pair) errors.pair = ["Pair not found"];
    if (!params.minPrice) errors.minPrice = ["Min price is required"];
    if (!params.maxPrice) errors.maxPrice = ["Max price is required"];
    if (!params.gridAmount) errors.gridAmount = ["Grid amount is required"];
    if (!params.quantityPreGrid) errors.quantityPreGrid = ["Quantity pre grid is required"];
    if (params.slippage && (params.slippage < 0 || params.slippage > 100))
      errors.slippage = ["Slippage must be between 0 and 100"];
    if (!params.name) errors.name = ["Name is required"];
    if (new Big6(params.minPrice).gte(params.maxPrice))
      errors.price = ["Min price must be less than max price"];
    if (Object.keys(errors).length > 0) {
      return errors;
    }
  });
}
function getGridTotalInvestment(params) {
  return __async(this, null, function* () {
    const { minPrice, maxPrice, gridAmount, quantityPreGrid } = params;
    if (!minPrice || !maxPrice || !gridAmount || !quantityPreGrid) return;
    const entryPrice = yield getPairPrice(params.pairId);
    const roundDecimals = 6;
    const gridInfo = {
      buy: [],
      sell: [],
      wait: []
    };
    const gridSpacing = new Big6(maxPrice).minus(minPrice).div(gridAmount);
    for (let i = 0; i <= Number(gridAmount); i++) {
      const gridPrice = new Big6(minPrice).plus(gridSpacing.times(i));
      if (new Big6(minPrice).gt(gridPrice)) {
        gridInfo.buy.push(gridPrice);
      } else {
        gridInfo.sell.push(gridPrice);
      }
    }
    if (!gridInfo.buy.length && gridInfo.sell.length) {
      gridInfo.wait.push(gridInfo.sell.shift());
    } else if (!gridInfo.sell.length && gridInfo.buy.length) {
      gridInfo.wait.push(gridInfo.buy.pop());
    } else {
      const upperDiff = new Big6(gridInfo.sell[0]).minus(entryPrice);
      const lowerDiff = new Big6(entryPrice).minus(gridInfo.buy[gridInfo.buy.length - 1]);
      gridInfo.wait.push(upperDiff.gt(lowerDiff) ? gridInfo.buy.pop() : gridInfo.sell.shift());
    }
    const baseInvestmentPerGrid = new Big6(quantityPreGrid || 0);
    if (baseInvestmentPerGrid.eq(0)) return;
    const gridOffset = gridSpacing.div(new Big6(1).div(baseInvestmentPerGrid)).round(roundDecimals, Big6.roundUp).toString();
    const firstBaseAmount = baseInvestmentPerGrid.round(roundDecimals, Big6.roundUp).toString();
    const lastBaseAmount = firstBaseAmount;
    const firstQuoteAmount = baseInvestmentPerGrid.times(minPrice).round(roundDecimals, Big6.roundUp).toString();
    const lastQuoteAmount = new Big6(firstQuoteAmount).plus(new Big6(gridOffset).times(gridAmount)).round(roundDecimals, Big6.roundUp).toString();
    const gridBuyCount = gridInfo.buy.length;
    const gridSellCount = gridInfo.sell.length;
    const totalBaseInvestment = new Big6(firstBaseAmount).times(gridSellCount).toString();
    const totalQuoteInvestment = new Big6(firstQuoteAmount).times(gridBuyCount).plus(
      new Big6(gridOffset || 0).times(gridBuyCount - 1).times(gridBuyCount).div(2)
    ).toString();
    return {
      gridOffset,
      firstBaseAmount,
      lastBaseAmount,
      firstQuoteAmount,
      lastQuoteAmount,
      gridBuyCount,
      gridSellCount,
      totalBaseInvestment,
      totalQuoteInvestment,
      entryPrice,
      gridInfo
    };
  });
}
function getGridMinDeposit(params) {
  return __async(this, null, function* () {
    const { minPrice, maxPrice } = params;
    const { minBaseDeposit, minQuoteDeposit } = yield getMinDeposit(params.pairId, "grid");
    if (new Big6(minPrice || 0).eq(0) || new Big6(maxPrice || 0).eq(0))
      return minBaseDeposit.toString() || "0";
    const result = Math.max(
      Number(minBaseDeposit || "0"),
      new Big6(minQuoteDeposit || "0").div(minPrice).toNumber()
    );
    const pair = yield getPair(params.pairId);
    return parseDisplayAmount(result, pair == null ? void 0 : pair.base_token.symbol, { rm: Big6.roundUp });
  });
}
function createGridVault(params) {
  return __async(this, null, function* () {
    const errors = yield validateGridVaultParams(params);
    if (errors) throw new Error(JSON.stringify(errors));
    const _params = yield transformGridVaultParams(params);
    const chain = globalState.get("chain");
    const trans = yield chain === "near" ? botNearContractServices.createGridBot(__spreadProps(__spreadValues({}, _params), { type: "grid" })) : botSolanaContractServices.createGridBot(__spreadProps(__spreadValues({}, _params), { type: "grid" }));
    return trans;
  });
}
function transformGridVaultParams(params) {
  return __async(this, null, function* () {
    const pair = yield getPair(params.pairId);
    if (!pair) throw new Error("Pair not found");
    const {
      gridOffset,
      firstBaseAmount,
      lastBaseAmount,
      firstQuoteAmount,
      lastQuoteAmount,
      totalBaseInvestment,
      totalQuoteInvestment,
      gridBuyCount,
      gridSellCount,
      entryPrice
    } = (yield getGridTotalInvestment(params)) || {};
    const formattedParams = {
      grid_buy_count: gridBuyCount,
      grid_sell_count: gridSellCount,
      grid_type: "EqOffset",
      grid_offset: gridOffset,
      slippage: params.slippage || 1,
      fill_base_or_quote: true,
      first_base_amount: firstBaseAmount,
      last_base_amount: lastBaseAmount,
      first_quote_amount: firstQuoteAmount,
      last_quote_amount: lastQuoteAmount,
      name: params.name,
      base_token: pair.base_token,
      quote_token: pair.quote_token,
      total_base_investment: totalBaseInvestment,
      total_quote_investment: totalQuoteInvestment,
      pair_id: pair.pair_id,
      entry_price: entryPrice,
      take_profit_price: void 0,
      trigger_price: void 0,
      stop_loss_price: void 0
    };
    return __spreadValues({}, formattedParams);
  });
}
function claimGridVault(params) {
  return __async(this, null, function* () {
    const chain = globalState.get("chain");
    const trans = chain === "near" ? botNearContractServices.claimGridBot(params.botId) : botSolanaContractServices.claimGridBot(params.botId);
    return trans;
  });
}
function closeGridVault(params) {
  return __async(this, null, function* () {
    const chain = globalState.get("chain");
    const trans = chain === "near" ? botNearContractServices.closeGridBot(params.botId) : botSolanaContractServices.closeGridBot(params.botId);
    return trans;
  });
}

// src/lib/vault/swing.ts
import Big7 from "big.js";
function validateSwingVaultParams(swingType, params) {
  return __async(this, null, function* () {
    validateAccountId();
    const errors = {};
    const pair = yield getPair(params.pairId);
    const pairPrice = yield getPairPrice(params.pairId);
    if (!pair) errors.pair = ["Pair not found"];
    if (swingType === "classic") {
      const _params = params;
      if (!_params.buyPrice) errors.buyPrice = ["Buy price is required"];
      if (!_params.sellPrice) errors.sellPrice = ["Sell price is required"];
      if (!_params.everyPhasedAmount) errors.everyPhasedAmount = ["Every phased amount is required"];
      if (new Big7(_params.buyPrice).gt(pairPrice)) {
        errors.buyPrice = ["Buy price is greater than current price"];
      }
      if (new Big7(_params.sellPrice).lt(pairPrice)) {
        errors.sellPrice = ["Sell price is less than current price"];
      }
    } else {
      const _params = params;
      if (_params.gridAmount < 2 || _params.gridAmount > 8) {
        errors.gridAmount = ["Grid amount must be between 2 and 8"];
      }
      if (!_params.intervalPrice) {
        errors.intervalPrice = ["Interval price is required"];
      }
      if (_params.tradeType === "buy") {
        if (!_params.highestBuyPrice)
          errors.highestBuyPrice = ["Highest buy price is required for buy trades"];
        else if (new Big7(_params.highestBuyPrice).lt(pairPrice)) {
          errors.highestBuyPrice = ["Highest buy price is less than current price"];
        }
      }
      if (_params.tradeType === "sell") {
        if (!_params.lowestSellPrice)
          errors.lowestSellPrice = ["Lowest sell price is required for sell trades"];
        else if (new Big7(_params.lowestSellPrice).gt(pairPrice)) {
          errors.lowestSellPrice = ["Lowest sell price is greater than current price"];
        }
      }
      const maxIntervalPrice = yield calculateMaxIntervalPrice("phased", _params);
      if (_params.intervalPrice) {
        if (_params.tradeType === "buy" && new Big7(_params.intervalPrice).gt(maxIntervalPrice)) {
          errors.intervalPrice = [`Interval price must be less than or equal to ${maxIntervalPrice}`];
        }
        if (_params.tradeType === "sell" && new Big7(_params.intervalPrice).gte(maxIntervalPrice)) {
          errors.intervalPrice = [`Interval price must be less than to ${maxIntervalPrice}`];
        }
      }
    }
    if (!params.name) errors.name = ["Name is required"];
    if (params.slippage && (params.slippage < 0 || params.slippage > 100))
      errors.slippage = ["Slippage must be between 0 and 100"];
    if (Object.keys(errors).length > 0) {
      return errors;
    }
  });
}
function getSwingTotalInvestment(swingType, params) {
  return __async(this, null, function* () {
    const { tradeType, minPrice, maxPrice, gridAmount, intervalPrice, everyPhasedAmount } = transformParams(swingType, params);
    const entryPrice = yield getPairPrice(params.pairId);
    if (!minPrice && !maxPrice || !gridAmount || !everyPhasedAmount || gridAmount > 1 && !intervalPrice)
      return;
    const roundDecimals = 6;
    const gridInfo = { buy: [], sell: [], wait: [] };
    const _intervalPrice = (minPrice && maxPrice ? new Big7(maxPrice).minus(minPrice).abs().div(gridAmount - 1 || 1).toString() : intervalPrice) || "0";
    const _minPrice = minPrice || new Big7(maxPrice || 0).minus(new Big7(_intervalPrice).times(gridAmount - 1)).toString();
    const _maxPrice = maxPrice || new Big7(minPrice || 0).plus(new Big7(_intervalPrice).times(gridAmount - 1)).toString();
    for (let i = 0; i < Number(gridAmount); i++) {
      const gridPrice = tradeType === "buy" ? new Big7(gridAmount === 1 ? _minPrice : _maxPrice).minus(new Big7(_intervalPrice).times(i)) : new Big7(gridAmount === 1 ? _maxPrice : _minPrice).plus(new Big7(_intervalPrice).times(i));
      tradeType === "buy" ? gridInfo.buy.push(gridPrice) : gridInfo.sell.push(gridPrice);
    }
    if (gridAmount === 1) {
      const waitPrice = tradeType === "buy" ? _maxPrice : _minPrice;
      waitPrice && gridInfo.wait.push(new Big7(waitPrice));
    }
    const baseInvestmentPerGrid = new Big7(everyPhasedAmount || 0);
    if (baseInvestmentPerGrid.eq(0)) return;
    const gridOffset = new Big7(_intervalPrice).div(new Big7(1).div(baseInvestmentPerGrid)).round(roundDecimals, Big7.roundUp).toString();
    const firstBaseAmount = baseInvestmentPerGrid.round(roundDecimals, Big7.roundUp).toString();
    const lastBaseAmount = firstBaseAmount;
    const firstQuoteAmount = baseInvestmentPerGrid.times(_minPrice).round(roundDecimals, Big7.roundUp).toString();
    const lastQuoteAmount = new Big7(firstQuoteAmount).plus(new Big7(gridOffset).times(gridAmount - 1 || 1)).round(roundDecimals, Big7.roundUp).toString();
    const gridBuyCount = gridInfo.buy.length;
    const gridSellCount = gridInfo.sell.length;
    const totalBaseInvestment = new Big7(firstBaseAmount).times(gridInfo.sell.length).toString();
    const totalQuoteInvestment = new Big7(firstQuoteAmount).times(gridBuyCount).plus(
      new Big7(gridOffset || 0).times(gridBuyCount - 1).times(gridBuyCount).div(2)
    ).toString();
    return {
      gridOffset,
      firstBaseAmount,
      lastBaseAmount,
      firstQuoteAmount,
      lastQuoteAmount,
      gridBuyCount,
      gridSellCount,
      totalBaseInvestment,
      totalQuoteInvestment,
      entryPrice,
      gridInfo
    };
  });
}
function getSwingMinDeposit(swingType, params) {
  return __async(this, null, function* () {
    const { minBaseDeposit, minQuoteDeposit } = yield getMinDeposit(params.pairId, "swing");
    const { minPrice, maxPrice, tradeType } = transformParams(swingType, params);
    const price = tradeType === "buy" && swingType === "classic" || tradeType === "sell" && swingType === "phased" ? minPrice : maxPrice;
    if (new Big7(price || 0).eq(0)) return minBaseDeposit.toString() || "0";
    const result = Math.max(
      Number(minBaseDeposit || "0"),
      new Big7(minQuoteDeposit || "0").div(price || 1).toNumber()
    );
    const pair = yield getPair(params.pairId);
    return parseDisplayAmount(result, pair == null ? void 0 : pair.base_token.symbol, { rm: Big7.roundUp });
  });
}
function createSwingVault(swingType, params) {
  return __async(this, null, function* () {
    const errors = yield validateSwingVaultParams(swingType, params);
    if (errors) throw new Error(JSON.stringify(errors));
    const _params = yield transformSwingVaultParams(swingType, params);
    const chain = globalState.get("chain");
    const trans = yield chain === "near" ? botNearContractServices.createGridBot(__spreadProps(__spreadValues({}, _params), { type: "grid" })) : botSolanaContractServices.createGridBot(__spreadProps(__spreadValues({}, _params), { type: "grid" }));
    return trans;
  });
}
function calculateMaxIntervalPrice(swingType, params) {
  return __async(this, null, function* () {
    const { minPrice, maxPrice, gridAmount, tradeType } = transformParams(swingType, params);
    const pair = yield getPair(params.pairId);
    if (!pair) throw new Error("Pair not found");
    if (tradeType === "buy") {
      return maxPrice ? parseDisplayPrice(
        new Big7(maxPrice).minus(new Big7(10).pow(-+(pair.base_token.decimals || 2))).div(gridAmount).toString(),
        pair.base_token.symbol,
        { rm: Big7.roundDown }
      ) : 0;
    } else {
      return minPrice;
    }
  });
}
function transformSwingVaultParams(swingType, params) {
  return __async(this, null, function* () {
    const pair = yield getPair(params.pairId);
    if (!pair) throw new Error("Pair not found");
    const {
      gridOffset,
      firstBaseAmount,
      lastBaseAmount,
      firstQuoteAmount,
      lastQuoteAmount,
      totalBaseInvestment,
      totalQuoteInvestment,
      gridBuyCount,
      gridSellCount,
      entryPrice
    } = (yield getSwingTotalInvestment(swingType, params)) || {};
    const formattedParams = {
      grid_buy_count: gridBuyCount,
      grid_sell_count: gridSellCount,
      grid_type: "EqOffset",
      grid_offset: gridOffset,
      slippage: params.slippage || 1,
      fill_base_or_quote: true,
      first_base_amount: firstBaseAmount,
      last_base_amount: lastBaseAmount,
      first_quote_amount: firstQuoteAmount,
      last_quote_amount: lastQuoteAmount,
      name: params.name,
      base_token: pair.base_token,
      quote_token: pair.quote_token,
      total_base_investment: totalBaseInvestment,
      total_quote_investment: totalQuoteInvestment,
      pair_id: pair.pair_id,
      entry_price: entryPrice,
      take_profit_price: void 0,
      trigger_price: void 0,
      stop_loss_price: void 0
    };
    return __spreadValues({}, formattedParams);
  });
}
function transformParams(swingType, params) {
  let minPrice;
  let maxPrice;
  let gridAmount;
  let intervalPrice;
  if (swingType === "classic") {
    const _params = params;
    minPrice = _params.buyPrice;
    maxPrice = _params.sellPrice;
    gridAmount = 1;
    intervalPrice = "";
  } else {
    const _params = params;
    minPrice = _params.lowestSellPrice || "";
    maxPrice = _params.highestBuyPrice || "";
    gridAmount = _params.gridAmount;
    intervalPrice = _params.intervalPrice;
  }
  return __spreadProps(__spreadValues({}, params), { minPrice, maxPrice, gridAmount, intervalPrice });
}

// src/lib/index.ts
var DeltaTradeSDK = class _DeltaTradeSDK {
  constructor({ chain, network, accountId, nearConfig, solanaConfig }) {
    __publicField(this, "getPairs", getPairs);
    __publicField(this, "getPairPrices", getPairPrices);
    __publicField(this, "validateGridVaultParams", validateGridVaultParams);
    __publicField(this, "getGridMinDeposit", getGridMinDeposit);
    __publicField(this, "getGridTotalInvestment", getGridTotalInvestment);
    __publicField(this, "createGridVault", createGridVault);
    __publicField(this, "validateSwingVaultParams", validateSwingVaultParams);
    __publicField(this, "getSwingMinDeposit", getSwingMinDeposit);
    __publicField(this, "getSwingTotalInvestment", getSwingTotalInvestment);
    __publicField(this, "createClassicSwingVault", createSwingVault);
    __publicField(this, "createPhasedSwingVault", createSwingVault);
    __publicField(this, "validateDCAVaultParams", validateDCAVaultParams);
    __publicField(this, "getDCAMinDeposit", getDCAMinDeposit);
    __publicField(this, "getDCATotalInvestment", getDCATotalInvestment);
    __publicField(this, "createDCAVault", createDCAVault);
    __publicField(this, "claimGridVault", claimGridVault);
    __publicField(this, "claimSwingVault", claimGridVault);
    __publicField(this, "claimDCAVault", claimDCAVault);
    __publicField(this, "closeGridVault", closeGridVault);
    __publicField(this, "closeSwingVault", closeGridVault);
    __publicField(this, "closeDCAVault", closeDCAVault);
    __publicField(this, "getMyGridVaults", getMyGridVaults);
    __publicField(this, "getMySwingVaults", getMySwingVaults);
    __publicField(this, "getMyDCAVaults", getMyDCAVaults);
    __publicField(this, "getMarketGridVaults", getMarketGridVaults);
    __publicField(this, "getMarketSwingVaults", getMarketSwingVaults);
    __publicField(this, "getMarketDCAVaults", getMarketDCAVaults);
    __publicField(this, "getMarketInfo", getMarketInfo);
    __publicField(this, "getAccountAssets", getAccountAssets);
    __publicField(this, "withdrawAccountAsset", withdrawAccountAsset);
    __publicField(this, "generateReferralUrl", generateReferralUrl);
    globalState.set("chain", chain);
    globalState.set("network", network);
    globalState.set("accountId", accountId);
    globalState.set("nearConfig", nearConfig);
    globalState.set("solanaConfig", solanaConfig);
  }
  /**
   * @description Initialize the SDK environment
   * @example const sdk = DeltaTradeSDK.initEnv({ chain: 'near', network: 'mainnet',accountId: 'accountId' });
   */
  static initEnv(params) {
    return new _DeltaTradeSDK(params);
  }
  changeEnv(params) {
    if (params.chain) globalState.set("chain", params.chain);
    if (params.network) globalState.set("network", params.network);
    if (params.accountId) globalState.set("accountId", params.accountId);
  }
};
export {
  DeltaTradeSDK as default
};
//# sourceMappingURL=index.js.map
