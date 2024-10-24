import { getTokenAddress, getTokenByAddress } from '@/utils/token';
import { botInnerApiPrefix, request, type WrapperResponse } from '.';
import { generateUrl } from '@/utils/common';
import { parseDisplayPrice } from '@/utils/format';
import { CHAINS, getConfigs } from '@/config';
import { globalState } from '@/stores';
import type { BotModel } from '../types/bot';
import { Chain } from '../types/contract';

interface PriceReport {
  contract_address: string;
  symbol: string;
  price_list: { date_time: number; price: string }[];
}

export interface KlineItem {
  pair: string;
  price: string;
  low: string;
  high: string;
  time: number;
}

export const pairServices = {
  pairs: {} as Record<Chain, BotModel.BotPair[]>,
  async queryAll() {
    if (CHAINS.every((chain) => this.pairs[chain]?.length)) return this.pairs;
    const res = await Promise.all(CHAINS.map((chain) => this.query(chain)));
    return res.reduce(
      (acc, cur, i) => {
        acc[CHAINS[i]] = cur;
        return acc;
      },
      {} as Record<Chain, BotModel.BotPair[]>,
    );
  },
  async query(chain = globalState.get('chain')) {
    if (this.pairs[chain]?.length) return this.pairs[chain];
    if (this.pairs[chain]?.length) return this.pairs[chain];
    const { data } = await request<WrapperResponse<BotModel.BotPair[]>>(
      botInnerApiPrefix('/bot/grid/pairs', chain),
    ).catch(() => ({ data: [] }));
    data?.forEach((item) => {
      item.symbol = `${item.base_token.symbol}_${item.quote_token.symbol}`;
      item.chain = chain;
    });
    this.pairs[chain] = data || [];
    return data || [];
  },

  async queryPairPrice(pair_id: string | string[]) {
    const ids: string[] = Array.isArray(pair_id) ? pair_id : [pair_id];
    const prices = await this.queryPrice();
    const result = {} as Record<
      string,
      {
        pair_id: string;
        basePrice: string;
        quotePrice: string;
        pairPrice: string;
      }
    >;
    ids.map((id) => {
      const [baseToken, quoteToken] = id.split(':');
      const basePrice = prices?.[baseToken] || '0';
      const quotePrice = prices?.[quoteToken] || '0';
      const pairPrice = parseDisplayPrice(
        Number(basePrice) / Number(quotePrice),
        getTokenByAddress(baseToken)?.symbol!,
      );
      result[id] = { pair_id: id, basePrice, quotePrice, pairPrice };
    });
    return result;
  },

  async queryPrice<T extends string | string[]>(tokens?: T) {
    const _tokens = Array.isArray(tokens) ? tokens : tokens ? [tokens] : [];
    const { data } = await request<WrapperResponse<Record<string, string>>>(
      generateUrl(botInnerApiPrefix('/prices'), {
        tokens: _tokens?.join(','),
      }),
      { cacheTimeout: 10000 },
    );
    return data;
  },
  tickers: {} as Record<string, BotModel.PairTicker>,
  async queryTicker(pair_id: string | string[]) {
    const ids = Array.isArray(pair_id) ? pair_id : [pair_id];
    const pairPrices = await this.queryPairPrice(ids);
    const tickers = await Promise.all(
      ids.map(async (id) => {
        const { data } = await request<WrapperResponse<BotModel.PairTicker>>(
          generateUrl(botInnerApiPrefix('/bot/grid/ticker'), { pair_id: id }),
          { cacheTimeout: 60000 },
        ).catch(() => ({ data: undefined }));
        if (!data) return this.tickers[id];
        const price = pairPrices[id].pairPrice;
        const newData = {
          ...data,
          last_price: price,
        };
        this.tickers[id] = newData;
        return newData;
      }),
    );
    const result = tickers.reduce(
      (acc, cur) => {
        acc[cur.pair_id] = cur;
        return acc;
      },
      {} as Record<string, BotModel.PairTicker>,
    );
    return result;
  },
  async queryPriceByIndexer(symbol: string) {
    const { price } = await request<{ price: string }>(
      generateUrl(getConfigs().indexerHost + '/get-token-price', {
        token_id: getTokenAddress(symbol, 'near', 'mainnet'),
      }),
    );
    return price;
  },

  async queryPriceReport({
    base,
    quote,
    dimension = 'M',
  }: {
    base: string;
    quote: string;
    dimension?: 'D' | 'W' | 'M' | 'Y';
  }) {
    const { price_list } = await request<PriceReport>(
      generateUrl(getConfigs().indexerHost + '/token-price-report', {
        token: getTokenAddress(base, 'near', 'mainnet'),
        base_token: getTokenAddress(quote, 'near', 'mainnet'),
        dimension,
      }),
      { retryCount: 0 },
    );
    const res = price_list.map(({ date_time, price }) => ({
      name: date_time,
      value: Number(price),
    }));
    return res;
  },
  async queryHistoryPriceReport({ base, quote }: { base: string; quote: string }) {
    const { price_list } = await request<PriceReport>(
      generateUrl(getConfigs().indexerHost + '/history-token-price-report', {
        token: getTokenAddress(base, 'near', 'mainnet'),
        base_token: getTokenAddress(quote, 'near', 'mainnet'),
      }),
      { retryCount: 0 },
    );
    const res = price_list.map(({ date_time, price }) => ({
      name: date_time,
      value: Number(price),
    }));
    return res;
  },
};
