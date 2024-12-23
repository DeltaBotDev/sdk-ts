import { getTokenAddress, getTokenByAddress } from '@/utils/token';
import { botInnerApiPrefix, request, type WrapperResponse } from '.';
import { generateUrl } from '@/utils/common';
import { parseDisplayPrice } from '@/utils/format';
import { CHAINS, getConfigs } from '@/config';
import { globalState } from '@/stores';
import type { BotModel } from '../types/bot';
import { Chain } from '../types/contract';
import dayjs from '@/utils/dayjs';

export interface PairPrice {
  pair_id: string;
  basePrice: string;
  quotePrice: string;
  pairPrice: string;
}

export interface KlineItem {
  pair: string;
  price: string;
  low: string;
  high: string;
  time: number;
}

export const pairServices = {
  async queryAll(cacheTimeout = 30000) {
    const res = await Promise.all(CHAINS.map((chain) => this.query(chain, cacheTimeout)));
    return res.reduce(
      (acc, cur, i) => {
        acc[CHAINS[i]] = cur;
        return acc;
      },
      {} as Record<Chain, BotModel.BotPair[]>,
    );
  },
  async query(chain = globalState.get('chain'), cacheTimeout = 30000) {
    const { data } = await request<WrapperResponse<BotModel.BotPair[]>>(
      generateUrl(botInnerApiPrefix('/pair/list', chain), { type: 'all' }),
      { cacheTimeout },
    );
    return (
      data?.map((item) => {
        const symbol = `${item.base_token.symbol}_${item.quote_token.symbol}`;
        const types: BotModel.BotType[] = [];
        if (item.support_grid) types.push('grid', 'swing');
        if (item.support_dca) types.push('dca');
        if (!item.support_grid && !item.support_dca) types.push('grid', 'swing', 'dca');
        return {
          ...item,
          symbol,
          types,
          chain,
        };
      }) || []
    );
  },

  async queryPairPrice(pair_id: string | string[]) {
    const ids: string[] = Array.isArray(pair_id) ? pair_id : [pair_id];
    const pairs = await this.query();
    const prices = await this.queryPrice();
    const result = {} as Record<string, PairPrice>;
    ids.map((id) => {
      const [baseToken, quoteToken] = id.split(':');
      const basePrice = prices?.[baseToken] || '0';
      const quotePrice = prices?.[quoteToken] || '0';
      const pairPrice = pairs.find((p) => p.pair_id === id)?.pair_price || '0';
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
  async queryTicker(pair_id: string | string[]) {
    if (!pair_id.length) return;
    const ids = Array.isArray(pair_id) ? pair_id : [pair_id];
    // const pairPrices = await this.queryPairPrice(ids);
    const res = await request<WrapperResponse<BotModel.PairTicker[]>>(
      generateUrl(botInnerApiPrefix('/bot/grid/tickers'), {
        pair_ids: ids.join(','),
      }),
    );
    const tickers = res.data?.reduce(
      (acc, cur) => {
        acc[cur.pair_id] = {
          ...cur,
          // last_price: pairPrices[cur.pair_id].pairPrice,
        };
        return acc;
      },
      {} as Record<string, BotModel.PairTicker>,
    );
    return tickers;
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
    const unit =
      dimension === 'D' ? 'day' : dimension === 'W' ? 'week' : dimension === 'M' ? 'month' : 'year';
    const params = {
      pair_id: `${getTokenAddress(base)}:${getTokenAddress(quote)}`,
      start: dayjs().startOf('minute').subtract(1, unit).valueOf(),
      end: dayjs().startOf('minute').valueOf(),
      limit: 12,
    };

    const url = generateUrl(botInnerApiPrefix('/klines'), params);
    const { data } = await request<WrapperResponse<KlineItem[]>>(url, { cacheTimeout: 600000 });
    const res = data?.map(({ time, price }) => ({
      name: time,
      value: Number(price),
    }));
    return res;
  },
};
