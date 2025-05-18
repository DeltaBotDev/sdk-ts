import { generateUrl } from '@/utils/common';
import {
  type PaginationParams,
  request,
  type WrapperResponse,
  type PaginationResponse,
  botInnerApiPrefix,
} from '../';
import { formatAmount, formatDurationHumanize } from '@/utils/format';
import Big from 'big.js';

import { getTokenByAddress } from '@/stores/tokens';
import dayjs from '@/utils/dayjs';
import { DCA_PRICE_DECIMALS } from './contract';
import { globalState } from '@/stores';
import type { BotModel } from '../../types/bot';
import { Chain } from '../../types/contract';

interface BotSummary {
  average_apy: string;
  profit_24: string;
  profit_30: string;
  top_apy: string;
  total_investment: string;
  total_arbitrage_profit: string;
  current_arbitrage_profit: string;
  current_investment: string;
}
export type BotQueryParams<T extends BotModel.BotType = BotModel.BotType> = PaginationParams & {
  bot_type?: T;
  account_id?: string;
  status?: 'position' | 'history';
  pair_id?: string;
  order_by?: string;
  dir?: 'asc' | 'desc';
};
export const botServices = {
  async querySummary() {
    const accountId = globalState.get('accountId');
    const { data } = await request<WrapperResponse<BotSummary>>(
      generateUrl(botInnerApiPrefix('/user/bot/summary'), {
        account_id: accountId,
      }),
    );
    return data;
  },
  async query<T extends BotModel.BotType = BotModel.BotType>(
    type: T,
    params: BotQueryParams<T>,
  ): Promise<PaginationResponse<BotModel.MarketBot<T>>['data'] | undefined> {
    switch (type) {
      case 'dca':
        return dcaBotServices.query(params as BotQueryParams<'dca'>) as any;
      default:
        return gridBotServices.query({ ...params, bot_type: type }) as any;
    }
  },

  async queryDetail<T extends BotModel.BotType = BotModel.BotType>(
    type: T,
    bot_id: number | string,
    chain?: Chain,
  ): Promise<BotModel.Bot<T> | undefined> {
    switch (type) {
      case 'dca':
        return dcaBotServices.queryDetail(bot_id as string, type, chain) as any;
      default:
        return gridBotServices.queryDetail(bot_id as number, type, chain);
    }
  },
};

type GridBotQueryDetailLogsParams = PaginationParams & { bot_id: number };
export const gridBotServices = {
  async query(params: BotQueryParams) {
    try {
      if (!params.account_id) return { list: [], has_next_page: false };
      const { page = 1, pageSize: limit = 10, status, ...rest } = params;
      const offset = (page - 1) * limit;
      let transformedStatus: string | undefined = undefined;
      if (typeof status === 'string') {
        transformedStatus = status === 'position' ? 'active,expired' : 'closed';
      }
      const transformedParams = this.transformQueryBotParams({
        limit,
        offset,
        status: transformedStatus,
        ...rest,
      });
      const { data } = await request<PaginationResponse<BotModel.MarketBot>>(
        generateUrl(botInnerApiPrefix('/bots'), transformedParams),
      );
      if (data?.list?.length) {
        data.list = data.list.map((item, index) => ({
          ...this.transformData(item),
          index: index + limit * (page - 1) + 1,
        }));
      }
      return data;
    } catch (error) {
      return { list: [], has_next_page: false };
    }
  },

  async queryDetail<T extends BotModel.BotType = 'grid'>(bot_id: number, type: T, chain?: Chain) {
    const _type = type === 'swing' ? 'grid' : type;
    const { data } = await request<WrapperResponse<BotModel.Bot<T> | undefined>>(
      generateUrl(botInnerApiPrefix('/bot', chain ?? globalState.get('chain')), {
        bot_id,
        type: _type,
      }),
    );
    return data ? this.transformData(data, chain) : undefined;
  },
  async queryDetailLogs<T extends BotModel.BotDetailRecordType>(
    params: GridBotQueryDetailLogsParams & { recordType: T },
  ) {
    const { recordType, ...rest } = params;
    switch (recordType) {
      case 'orders':
        return gridBotServices.queryOrders(rest);
      case 'trades':
        return gridBotServices.queryTrades(rest);
      case 'claims':
        return gridBotServices.queryClaims(rest);
    }
  },
  async queryOrders(params: GridBotQueryDetailLogsParams) {
    const { data } = await request<WrapperResponse<BotModel.GridBotOrder[]>>(
      generateUrl(botInnerApiPrefix('/bot/grid/orders'), params),
    );
    data?.sort((a, b) => Number(b.price) - Number(a.price));
    const list = data?.reduce((acc, item) => {
      const rawAmount = item.is_buy
        ? new Big(item.buy_token.volume).minus(item.buy_filled_volume).toString()
        : new Big(item.sell_token.volume).minus(item.sell_filled_volume).toString();
      if (new Big(rawAmount).lte(100)) return acc;
      const amount = formatAmount(
        rawAmount,
        item.is_buy ? item.buy_token.decimals : item.sell_token.decimals,
      );
      const total = new Big(item.price).times(amount).toString();
      acc.push({ ...item, amount, total, index: acc.length + 1 });
      return acc;
    }, [] as BotModel.GridBotOrder[]);

    return { list, has_next_page: false };
  },
  async queryTrades(params: GridBotQueryDetailLogsParams) {
    const { bot_id, page = 1, pageSize: limit = 10 } = params;
    const offset = (page - 1) * limit;
    const { data } = await request<PaginationResponse<BotModel.GridBotTrade>>(
      generateUrl(botInnerApiPrefix('/bot/grid/trades'), {
        bot_id,
        limit,
        offset,
      }),
    );
    data?.list?.forEach((item, index) => (item.index = index + limit * (page - 1) + 1));
    return data;
  },
  async queryClaims(params: GridBotQueryDetailLogsParams) {
    const { bot_id, page = 1, pageSize: limit = 10 } = params;
    const offset = (page - 1) * limit;
    const { data } = await request<PaginationResponse<BotModel.GridBotClaim>>(
      generateUrl(botInnerApiPrefix('/bot/grid/claims'), {
        bot_id,
        limit,
        offset,
      }),
    );
    data?.list?.forEach((item, index) => (item.index = index + limit * (page - 1) + 1));
    return data;
  },
  transformData<T extends BotModel.MarketBot | BotModel.Bot>(data: T, chain?: Chain) {
    if ('type' in data && data?.type === 'grid') {
      data.type = data.grid_style || data.type;
    }
    data.chain = (data.chain?.toLowerCase() || chain || globalState.get('chain')) as Chain;
    if ('base_order_price' in data || 'quote_order_price' in data) {
      const base = 'base_token' in data ? data.base_token : data.investment_base;
      const quote = 'quote_token' in data ? data.quote_token : data.investment_quote;
      const baseAmount = formatAmount(base.volume, base.decimals);
      const quoteAmount = formatAmount(quote.volume, quote.decimals);
      data.totalInvestmentUsd = new Big(baseAmount)
        .times(data.base_order_price || 0)
        .plus(new Big(quoteAmount).times(data.quote_order_price || 0))
        .toString();
    }
    return data;
  },
  transformQueryBotParams(data: { bot_type?: BotModel.BotType; [key: string]: any }) {
    const newData = { ...data };
    if (data?.bot_type && ['grid', 'swing'].includes(data?.bot_type)) {
      newData.bot_type = 'grid';
      newData.grid_style = data.bot_type;
    }
    return newData;
  },
};

export const dcaBotServices = {
  async query(params: BotQueryParams<'dca'>, all?: boolean) {
    try {
      if (!all && !params.account_id) return { list: [], has_next_page: false };
      const { page = 1, pageSize: limit = 10, status, dir: sort, order_by, ...rest } = params;
      const offset = (page - 1) * limit;
      let closed = -1;
      if (status) {
        if (['position', 'active'].includes(status)) {
          closed = 0;
        }
        if (['history', 'closed'].includes(status)) {
          closed = 1;
        }
      }
      const { data } = await request<PaginationResponse<BotModel.MarketBot<'dca'>>>(
        generateUrl(botInnerApiPrefix('/dca/list'), {
          limit,
          offset,
          closed,
          order_by: order_by === 'bot_create_time' ? 'time' : order_by,
          sort,
          ...rest,
        }),
      );
      if (data?.list?.length) {
        data.list = data.list.map((item, index) => ({
          ...this.transformData(item),
          index: index + limit * (page - 1) + 1,
        }));
      }
      return { list: data?.list || [], has_next_page: data?.has_next_page || false };
    } catch (error) {
      return { list: [], has_next_page: false };
    }
  },
  async queryDetail(bot_id: string, type = 'dca', chain?: Chain) {
    const { data } = await request<WrapperResponse<BotModel.Bot<'dca'> | undefined>>(
      generateUrl(botInnerApiPrefix('/dca/details', chain ?? globalState.get('chain')), {
        dca_id: bot_id,
      }),
    );
    return data ? this.transformData(data) : undefined;
  },
  async queryDetailLogs<T extends BotModel.BotDetailRecordType>(
    params: PaginationParams & { recordType: T; id: string },
  ) {
    const { recordType, ...rest } = params;
    switch (recordType) {
      case 'orders':
        return dcaBotServices.queryOrders(rest);
      case 'trades':
        return dcaBotServices.queryTrades(rest);
      case 'claims':
        return dcaBotServices.queryClaims(rest);
    }
  },
  async queryOrders(params: PaginationParams & { id: string }) {
    const bot = await this.queryDetail(params.id);
    if (bot) {
      const list = [];
      for (let i = bot.execute_count; i < bot.count; i++) {
        const order = {
          index: i - bot.execute_count + 1,
          tradeType: bot.tradeType,
          amount: formatAmount(bot.single_amount_in, bot.tokenIn?.decimals),
          time: dayjs(bot.start_time)
            .add(i * Number(bot.interval_time), 'ms')
            .valueOf(),
        };
        list.push(order);
      }
      return { list, has_next_page: false };
    }
    return { list: [], has_next_page: false };
  },
  async queryTrades(params: PaginationParams & { id: string }) {
    const bot = await this.queryDetail(params.id);
    if (!bot) return { list: [] };
    const { page = 1, pageSize: limit = 10, id: dca_id } = params;
    const offset = (page - 1) * limit;
    const { data } = await request<
      PaginationResponse<{
        index: number;
        dca_id: string;
        account_id: string;
        token: string;
        volume: string;
        time: number;
      }>
    >(generateUrl(botInnerApiPrefix('/dca/trades'), { dca_id, limit, offset }));
    const list = (data?.list || []).map((item, index) => {
      const amountIn = formatAmount(bot.single_amount_in, bot.tokenIn?.decimals);
      const amountOut = formatAmount(item.volume, bot.tokenOut?.decimals);
      const amount = bot.tradeType === 'buy' ? amountOut : amountIn;
      const price =
        bot.tradeType === 'buy'
          ? new Big(amountIn).div(amountOut).toString()
          : new Big(amountOut).div(amountIn).toString();
      const total = new Big(amount).times(price).round(12).toString();
      return { ...item, price, total, amount, index: index + limit * (page - 1) + 1 };
    });
    return { ...data, list };
  },
  async queryClaims(params: PaginationParams & { id: string }) {
    const { page = 1, pageSize: limit = 10, id: dca_id } = params;
    const offset = (page - 1) * limit;
    const { data } = await request<
      PaginationResponse<{
        index: number;
        dca_id: string;
        account_id: string;
        token: string;
        volume: string;
        tx_hash: string;
        time: number;
      }>
    >(generateUrl(botInnerApiPrefix('/dca/claims'), { dca_id, limit, offset }));

    data?.list?.forEach((item, index) => {
      item.index = index + limit * (page - 1) + 1;
    });
    return data;
  },
  async queryMarketData(pair_id: string) {
    type MarketData = {
      side: BotModel.TradeType;
      type: '1' | '7' | '30';
      pair_id: string;
      amount: string;
    };
    const { data } = await request<WrapperResponse<MarketData[]>>(
      generateUrl(botInnerApiPrefix('/dca/statistical'), { pair_id }),
    );
    //group by side_type
    const groupData = data?.reduce(
      (acc, item) => {
        acc[`${item.side}_${item.type}`] = item;
        return acc;
      },
      {} as Record<string, MarketData>,
    );

    return groupData;
  },
  transformData(bot: BotModel.Bot<'dca'>) {
    const data = { ...bot };
    const [base, quote] = data.pair_id.split(':');
    const lowestPrice = formatAmount(data.lowest_price, DCA_PRICE_DECIMALS);
    const highestPrice = formatAmount(data.highest_price, DCA_PRICE_DECIMALS);
    const baseToken = getTokenByAddress(base);
    const quoteToken = getTokenByAddress(quote);
    const tokenInMeta = getTokenByAddress(data.token_in);
    const tokenOutMeta = getTokenByAddress(data.token_out);
    data.id = data.dca_id;
    data.bot_id = data.dca_id;
    data.type = 'dca';
    data.status = data.closed ? 'closed' : 'active';
    data.tradeType = data.side;
    data.bot_create_time = data.dca_create_time;
    data.frequency = formatDurationHumanize(data.interval_time);
    data.baseToken = baseToken;
    data.quoteToken = quoteToken;
    data.tokenIn = tokenInMeta;
    data.tokenOut = tokenOutMeta;
    data.lowest_price =
      data.side === 'sell'
        ? lowestPrice
        : new Big(highestPrice || 0).gt(0)
          ? new Big(1).div(highestPrice).round(12, Big.roundDown).toString()
          : '0';
    data.highest_price =
      data.side === 'sell'
        ? highestPrice
        : new Big(lowestPrice || 0).gt(0)
          ? new Big(1).div(lowestPrice).round(12, Big.roundDown).toString()
          : '0';

    data.investmentAmount = formatAmount(
      new Big(data.single_amount_in).times(data.count).toString(),
      tokenInMeta?.decimals,
    );

    data.filledAmount = new Big(data.investmentAmount)
      .minus(formatAmount(data.left_amount_in, tokenInMeta?.decimals))
      .toString();

    data.filledPercent = new Big(data.filledAmount)
      .div(data.investmentAmount)
      .times(100)
      .toString();
    data.endTime = dayjs(data.start_time)
      .add(data.interval_time * (data.count - 1), 'ms')
      .valueOf();
    return data;
  },
};

interface MarketSummary {
  arbitrage_profit: string;
  bots: string;
  profit_24: string;
  position: string;
  total_position: string;
  total_users: string;
  total_bots: string;
}

interface BotCategory {
  name: string;
  description: string;
  type: BotModel.BotType;
  logo: string;
  total_users: number;
}

export const marketServices = {
  async querySummary() {
    const { data } = await request<WrapperResponse<MarketSummary>>(botInnerApiPrefix('/market'));
    const { data: volumeData } = await request<
      WrapperResponse<{ total: string; total_24h: string }>
    >(botInnerApiPrefix('/home/data'));
    return { ...data, volume_total: volumeData?.total, volume_24h: volumeData?.total_24h };
  },
  async queryBotCategories() {
    const { data } = await request<WrapperResponse<BotCategory[]>>(
      botInnerApiPrefix('/market/bots'),
    );
    return data?.filter((item) => !(globalState.get('chain') === 'solana' && item.type === 'dca'));
  },
  async queryTopBots(params?: { pair_id?: string; type?: BotModel.BotType }) {
    const { data } = await request<WrapperResponse<BotModel.MarketBot<'grid'>[]>>(
      generateUrl(botInnerApiPrefix('/market/bots/top24'), {
        ...params,
        chain: globalState.get('chain'),
      }),
    );
    if (params?.pair_id) {
      return data?.filter((item) => item.pair_id === params.pair_id);
    }
    return data?.map((v) => gridBotServices.transformData(v));
  },
  async queryAllBots<T extends BotModel.BotType = BotModel.BotType>(
    params?: PaginationParams & {
      bot_type?: T;
      order_by?: string;
      dir?: 'asc' | 'desc';
      pair_id?: string;
      account_id?: string;
    },
  ) {
    if (params?.bot_type === 'dca') {
      return dcaBotServices.query(params as BotQueryParams<'dca'>, true);
    }
    const {
      bot_type,
      order_by = 'bot_create_time',
      dir = 'desc',
      page = 1,
      pageSize: limit = 10,
      ...rest
    } = params || {};
    const offset = (page - 1) * limit;
    const transformedParams = gridBotServices.transformQueryBotParams({
      bot_type,
      limit,
      offset,
      order_by,
      dir,
      ...rest,
    });

    const { data } = await request<PaginationResponse<BotModel.MarketBot>>(
      generateUrl(
        botInnerApiPrefix(params?.account_id ? '/bots' : '/market/bots/all'),
        transformedParams,
      ),
    );
    if (data?.list?.length) {
      data.list = data.list.map((item, index) => ({
        ...gridBotServices.transformData(item),
        index: index + limit * (page - 1) + 1,
      }));
    }
    return { list: data?.list || [], has_next_page: data?.has_next_page || false };
  },
};
