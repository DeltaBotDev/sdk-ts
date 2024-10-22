import {
  BotContractServices,
  botContractServices,
  botNearContractServices,
  botSolanaContractServices,
  DCABotContractParams,
  GridBotContractParams,
} from '@/services/bot/contract';
import { pairServices } from '@/services/token';
import { globalState } from '@/stores';
import Big from 'big.js';

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
  await validatePair(params.pairId);
  const errors: { [key: string]: string[] } = {}; // 新增错误收集对象

  if (!params.count) errors.count = ['Count is required'];
  if (!params.singleAmountIn) errors.singleAmountIn = ['Single amount in is required'];
  if (!params.startTime) errors.startTime = ['Start time is required'];
  if (!params.intervalTime) errors.intervalTime = ['Interval time is required'];
  if (
    params.lowestPrice &&
    params.highestPrice &&
    new Big(params.lowestPrice).gt(params.highestPrice)
  ) {
    errors.price = ['Lowest price must be less than highest price'];
  }

  const pairPrices = await pairServices.queryPairPrice(params.pairId);
  if (!pairPrices) errors.pairPrice = ['Pair price not found'];
  if (params.lowestPrice && new Big(params.lowestPrice).gt(pairPrices[params.pairId].pairPrice)) {
    errors.lowestPrice = ['Lowest price is greater than current price'];
  }
  if (params.highestPrice && new Big(params.highestPrice).lt(pairPrices[params.pairId].pairPrice)) {
    errors.highestPrice = ['Highest price is less than current price'];
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }
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

function validateAccountId() {
  if (!globalState.get('accountId'))
    throw new Error('Please set accountId before creating a vault');
}

async function validatePair(pairId: string) {
  const pairs = await pairServices.query();
  const pair = pairs.find((p) => p.pair_id === pairId);
  if (!pair) throw new Error('Pair not found');
}

async function transformDCAVaultParams(params: CreateDCAVaultParams) {
  const [baseToken, quoteToken] = params.pairId.split(':');
  const pairs = await pairServices.query();
  const pair = pairs.find((p) => p.pair_id === params.pairId);
  if (!pair) throw new Error('Pair not found');
  const tokenIn = params.tradeType === 'buy' ? baseToken : quoteToken;
  const tokenOut = params.tradeType === 'buy' ? quoteToken : baseToken;
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
    slippage: params.slippage,
    recommender: params.recommender || undefined,
    base_token: pair.base_token,
    quote_token: pair.quote_token,
    total_base_investment: '0',
    total_quote_investment: '0',
  } as unknown as DCABotContractParams;
  const { total_base_investment = '0', total_quote_investment = '0' } =
    botContractServices.calculateDCAInfo(formattedParams) || {};

  return { ...formattedParams, total_base_investment, total_quote_investment };
}
