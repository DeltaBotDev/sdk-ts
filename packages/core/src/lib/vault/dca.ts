import {
  BotContractServices,
  botNearContractServices,
  botSolanaContractServices,
  DCABotContractParams,
} from '@/services/bot/contract';
import { pairServices } from '@/services/token';
import { globalState } from '@/stores';
import { formatNumber } from '@/utils/format';
import Big from 'big.js';
import { validateAccountId, getPair, getMinDeposit, getPairPrice } from '.';
import { Chain } from '../../types/contract';

/**
 * Parameters for creating a DCA vault.
 */
export interface CreateDCAVaultParams {
  /** The ID of the trading pair */
  pairId: string;
  /** The type of trade, either buying or selling */
  tradeType: 'buy' | 'sell';
  /** The start time for the DCA strategy */
  startTime: number;
  /** The time interval between trades */
  intervalTime: number;
  /** The amount of the base token to trade in each interval */
  singleAmountIn: number;
  /** The total number of trades to execute */
  count: number;
  /** The name of the DCA vault */
  name: string;
  /** The acceptable slippage for the trade */
  slippage?: number;
  /** The lowest price to buy at (for buy trades) */
  lowestPrice?: number;
  /** The highest price to sell at (for sell trades) */
  highestPrice?: number;
  /** An optional recommender ID */
  recommender?: string;
}

export async function validateDCAVaultParams(params: CreateDCAVaultParams) {
  validateAccountId();
  const errors: { [key: string]: string[] } = {};
  const pair = await getPair(params.pairId);
  if (!pair) errors.pair = ['Pair not found'];
  if (!params.count) errors.count = ['Count is required'];
  if (!params.singleAmountIn) errors.singleAmountIn = ['Single amount in is required'];
  if (!params.startTime) errors.startTime = ['Start time is required'];
  if (!params.intervalTime) errors.intervalTime = ['Interval time is required'];
  if (params.slippage && (params.slippage < 0 || params.slippage > 100))
    errors.slippage = ['Slippage must be between 0 and 100'];
  if (
    params.lowestPrice &&
    params.highestPrice &&
    new Big(params.lowestPrice).gt(params.highestPrice)
  ) {
    errors.price = ['Lowest price must be less than highest price'];
  }

  const pairPrice = await getPairPrice(params.pairId);
  if (params.lowestPrice && new Big(params.lowestPrice).gt(pairPrice)) {
    errors.lowestPrice = ['Lowest price is greater than current price'];
  }
  if (params.highestPrice && new Big(params.highestPrice).lt(pairPrice)) {
    errors.highestPrice = ['Highest price is less than current price'];
  }
  const minDeposit = await getDCAMinDeposit(params);
  const tokenInSymbol = params.tradeType === 'buy' ? pair?.base_token : pair?.quote_token;
  if (minDeposit && new Big(params.singleAmountIn || 0).lt(minDeposit)) {
    errors.singleAmountIn = [
      `The initial investment cannot be less than ${formatNumber(minDeposit, {
        maximumFractionDigits: 6,
      })} ${tokenInSymbol}`,
    ];
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }
}

export async function getDCAMinDeposit(params: Pick<CreateDCAVaultParams, 'pairId' | 'tradeType'>) {
  const { minBaseDeposit, minQuoteDeposit } = await getMinDeposit(params.pairId, 'dca');
  if (params.tradeType === 'buy') return minQuoteDeposit;
  return minBaseDeposit;
}

export async function getDCATotalInvestment(params: CreateDCAVaultParams) {
  const { tradeType, singleAmountIn, count } = params;
  if (!count || !singleAmountIn || !tradeType) return;
  const totalInvestment = new Big(singleAmountIn).times(count).toString();
  const totalBaseInvestment = tradeType === 'sell' ? totalInvestment : '0';
  const totalQuoteInvestment = tradeType === 'buy' ? totalInvestment : '0';

  return {
    totalBaseInvestment,
    totalQuoteInvestment,
  };
}

export async function createDCAVault<ChainType extends Chain>(
  params: CreateDCAVaultParams,
): Promise<ReturnType<BotContractServices<ChainType>['createDCABot']>> {
  const errors = await validateDCAVaultParams(params);
  if (errors) throw new Error(JSON.stringify(errors));
  const _params = await transformDCAVaultParams(params);

  const chain = globalState.get('chain') as ChainType;
  const trans = await (chain === 'near'
    ? botNearContractServices.createDCABot(_params)
    : botSolanaContractServices.createDCABot(_params));

  return trans as ReturnType<BotContractServices<ChainType>['createDCABot']>;
}

export async function claimDCAVault<ChainType extends Chain>(params: {
  botId: string;
}): Promise<ReturnType<BotContractServices<ChainType>['claimDCABot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.claimDCABot(params.botId)
      : botSolanaContractServices.claimDCABot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['claimDCABot']>;
}

export async function closeDCAVault<ChainType extends Chain>(params: {
  botId: string;
}): Promise<ReturnType<BotContractServices<ChainType>['closeDCABot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.closeDCABot(params.botId)
      : botSolanaContractServices.closeDCABot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['closeDCABot']>;
}

async function transformDCAVaultParams(params: CreateDCAVaultParams) {
  const pair = await getPair(params.pairId);
  if (!pair) throw new Error('Pair not found');
  const tokenIn = params.tradeType === 'buy' ? pair.base_token : pair.quote_token;
  const tokenOut = params.tradeType === 'buy' ? pair.quote_token : pair.base_token;
  const lowestPrice =
    params.tradeType === 'buy'
      ? params.lowestPrice
      : params.highestPrice
        ? new Big(1).div(params.highestPrice)
        : undefined;
  const highestPrice =
    params.tradeType === 'buy'
      ? params.highestPrice
      : params.lowestPrice
        ? new Big(1).div(params.lowestPrice)
        : undefined;
  const { totalBaseInvestment, totalQuoteInvestment } = (await getDCATotalInvestment(params)) || {};
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
    recommender: params.recommender || undefined,
    base_token: pair.base_token,
    quote_token: pair.quote_token,
    total_base_investment: totalBaseInvestment,
    total_quote_investment: totalQuoteInvestment,
  } as unknown as DCABotContractParams;

  return { ...formattedParams };
}
