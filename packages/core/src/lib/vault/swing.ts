import {
  BotContractServices,
  botNearContractServices,
  botSolanaContractServices,
  GridBotContractParams,
} from '@/services/bot/contract';
import { globalState } from '@/stores';
import { parseDisplayAmount, parseDisplayPrice } from '@/utils/format';
import Big from 'big.js';
import { validateAccountId, getPair, getMinDeposit, getPairPrice } from '.';
import { Chain } from '../../types/contract';

export interface CreateClassicSwingVaultParams {
  pairId: string;
  tradeType: 'buy' | 'sell';
  buyPrice: string;
  sellPrice: string;
  everyPhasedAmount: string;
  name: string;
  validityPeriod?: number;
  slippage?: number;
  recommender?: string;
}

export interface CreatePhasedSwingVaultParams {
  pairId: string;
  tradeType: 'buy' | 'sell';
  gridAmount: number;
  intervalPrice: string;
  everyPhasedAmount: string;
  highestBuyPrice?: string;
  lowestSellPrice?: string;
  name: string;
  validityPeriod?: number;
  slippage?: number;
  recommender?: string;
}

export type SwingVaultType = 'classic' | 'phased';

export type CreateSwingVaultParams<T extends SwingVaultType> = T extends 'classic'
  ? CreateClassicSwingVaultParams
  : CreatePhasedSwingVaultParams;

export async function validateSwingVaultParams<T extends SwingVaultType>(
  swingType: T,
  params: CreateSwingVaultParams<T>,
) {
  validateAccountId();
  const errors: { [key: string]: string[] } = {};
  const pair = await getPair(params.pairId);
  const pairPrice = await getPairPrice(params.pairId);
  if (!pair) errors.pair = ['Pair not found'];
  if (swingType === 'classic') {
    const _params = params as CreateClassicSwingVaultParams;
    if (!_params.buyPrice) errors.buyPrice = ['Buy price is required'];
    if (!_params.sellPrice) errors.sellPrice = ['Sell price is required'];
    if (!_params.everyPhasedAmount) errors.everyPhasedAmount = ['Every phased amount is required'];
    if (new Big(_params.buyPrice).gt(pairPrice)) {
      errors.buyPrice = ['Buy price is greater than current price'];
    }
    if (new Big(_params.sellPrice).lt(pairPrice)) {
      errors.sellPrice = ['Sell price is less than current price'];
    }
  } else {
    const _params = params as CreatePhasedSwingVaultParams;
    if (_params.gridAmount < 2 || _params.gridAmount > 8) {
      errors.gridAmount = ['Grid amount must be between 2 and 8'];
    }
    if (!_params.intervalPrice) {
      errors.intervalPrice = ['Interval price is required'];
    }
    if (_params.tradeType === 'buy') {
      if (!_params.highestBuyPrice)
        errors.highestBuyPrice = ['Highest buy price is required for buy trades'];
      else if (new Big(_params.highestBuyPrice).lt(pairPrice)) {
        errors.highestBuyPrice = ['Highest buy price is less than current price'];
      }
    }
    if (_params.tradeType === 'sell') {
      if (!_params.lowestSellPrice)
        errors.lowestSellPrice = ['Lowest sell price is required for sell trades'];
      else if (new Big(_params.lowestSellPrice).gt(pairPrice)) {
        errors.lowestSellPrice = ['Lowest sell price is greater than current price'];
      }
    }
    const maxIntervalPrice = await calculateMaxIntervalPrice('phased', _params);
    if (_params.intervalPrice) {
      if (_params.tradeType === 'buy' && new Big(_params.intervalPrice).gt(maxIntervalPrice)) {
        errors.intervalPrice = [`Interval price must be less than or equal to ${maxIntervalPrice}`];
      }
      if (_params.tradeType === 'sell' && new Big(_params.intervalPrice).gte(maxIntervalPrice)) {
        errors.intervalPrice = [`Interval price must be less than to ${maxIntervalPrice}`];
      }
    }
  }
  if (!params.name) errors.name = ['Name is required'];
  if (params.slippage && (params.slippage < 0 || params.slippage > 100))
    errors.slippage = ['Slippage must be between 0 and 100'];
  if (Object.keys(errors).length > 0) {
    return errors;
  }
}

export async function getSwingTotalInvestment<T extends SwingVaultType>(
  swingType: T,
  params: CreateSwingVaultParams<T>,
) {
  const { tradeType, minPrice, maxPrice, gridAmount, intervalPrice, everyPhasedAmount } =
    transformParams(swingType, params);
  const entryPrice = await getPairPrice(params.pairId);
  if (
    (!minPrice && !maxPrice) ||
    !gridAmount ||
    !everyPhasedAmount ||
    (gridAmount > 1 && !intervalPrice)
  )
    return;

  const roundDecimals = 6;
  const gridInfo: {
    buy: Big[];
    sell: Big[];
    wait: Big[];
  } = { buy: [], sell: [], wait: [] };

  const _intervalPrice =
    (minPrice && maxPrice
      ? new Big(maxPrice)
          .minus(minPrice)
          .abs()
          .div(gridAmount - 1 || 1)
          .toString()
      : intervalPrice) || '0';

  const _minPrice =
    minPrice ||
    new Big(maxPrice || 0).minus(new Big(_intervalPrice).times(gridAmount - 1)).toString();
  const _maxPrice =
    maxPrice ||
    new Big(minPrice || 0).plus(new Big(_intervalPrice).times(gridAmount - 1)).toString();

  for (let i = 0; i < Number(gridAmount); i++) {
    const gridPrice =
      tradeType === 'buy'
        ? new Big(gridAmount === 1 ? _minPrice : _maxPrice).minus(new Big(_intervalPrice).times(i))
        : new Big(gridAmount === 1 ? _maxPrice : _minPrice).plus(new Big(_intervalPrice).times(i));
    tradeType === 'buy' ? gridInfo.buy.push(gridPrice) : gridInfo.sell.push(gridPrice);
  }

  if (gridAmount === 1) {
    const waitPrice = tradeType === 'buy' ? _maxPrice : _minPrice;
    waitPrice && gridInfo.wait.push(new Big(waitPrice));
  }

  const baseInvestmentPerGrid = new Big(everyPhasedAmount || 0);
  if (baseInvestmentPerGrid.eq(0)) return;

  const gridOffset = new Big(_intervalPrice)
    .div(new Big(1).div(baseInvestmentPerGrid))
    .round(roundDecimals, Big.roundUp)
    .toString();
  const firstBaseAmount = baseInvestmentPerGrid.round(roundDecimals, Big.roundUp).toString();
  const lastBaseAmount = firstBaseAmount;

  const firstQuoteAmount = baseInvestmentPerGrid
    .times(_minPrice)
    .round(roundDecimals, Big.roundUp)
    .toString();
  const lastQuoteAmount = new Big(firstQuoteAmount)
    .plus(new Big(gridOffset).times(gridAmount - 1 || 1))
    .round(roundDecimals, Big.roundUp)
    .toString();

  const gridBuyCount = gridInfo.buy.length;
  const gridSellCount = gridInfo.sell.length;

  const totalBaseInvestment = new Big(firstBaseAmount).times(gridInfo.sell.length).toString();
  const totalQuoteInvestment = new Big(firstQuoteAmount)
    .times(gridBuyCount)
    .plus(
      new Big(gridOffset || 0)
        .times(gridBuyCount - 1)
        .times(gridBuyCount)
        .div(2),
    )
    .toString();

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
    gridInfo,
  };
}

export async function getSwingMinDeposit<T extends SwingVaultType>(
  swingType: T,
  params: CreateSwingVaultParams<T>,
) {
  const { minBaseDeposit, minQuoteDeposit } = await getMinDeposit(params.pairId, 'swing');
  const { minPrice, maxPrice, tradeType } = transformParams(swingType, params);
  const price =
    (tradeType === 'buy' && swingType === 'classic') ||
    (tradeType === 'sell' && swingType === 'phased')
      ? minPrice
      : maxPrice;

  if (new Big(price || 0).eq(0)) return minBaseDeposit.toString() || '0';
  const result = Math.max(
    Number(minBaseDeposit || '0'),
    new Big(minQuoteDeposit || '0').div(price || 1).toNumber(),
  );
  const pair = await getPair(params.pairId);
  return parseDisplayAmount(result, pair?.base_token.symbol!, { rm: Big.roundUp });
}

export async function createSwingVault<C extends Chain, S extends SwingVaultType>(
  swingType: S,
  params: CreateSwingVaultParams<S>,
) {
  const errors = await validateSwingVaultParams(swingType, params);
  if (errors) throw new Error(JSON.stringify(errors));
  const _params = await transformSwingVaultParams(swingType, params);
  const chain = globalState.get('chain') as C;
  const trans = await (chain === 'near'
    ? botNearContractServices.createGridBot({ ..._params, type: 'grid' })
    : botSolanaContractServices.createGridBot({ ..._params, type: 'grid' }));
  return trans as ReturnType<BotContractServices<C>['createGridBot']>;
}

async function calculateMaxIntervalPrice<T extends SwingVaultType>(
  swingType: T,
  params: CreateSwingVaultParams<T>,
) {
  const { minPrice, maxPrice, gridAmount, tradeType } = transformParams(swingType, params);
  const pair = await getPair(params.pairId);
  if (!pair) throw new Error('Pair not found');
  if (tradeType === 'buy') {
    return maxPrice
      ? parseDisplayPrice(
          new Big(maxPrice)
            .minus(new Big(10).pow(-+(pair.base_token.decimals || 2)))
            .div(gridAmount)
            .toString(),
          pair.base_token.symbol!,
          { rm: Big.roundDown },
        )
      : 0;
  } else {
    return minPrice;
  }
}

async function transformSwingVaultParams<T extends SwingVaultType>(
  swingType: T,
  params: CreateSwingVaultParams<T>,
) {
  const pair = await getPair(params.pairId);
  if (!pair) throw new Error('Pair not found');
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
    entryPrice,
  } = (await getSwingTotalInvestment(swingType, params)) || {};
  const formattedParams = {
    grid_buy_count: gridBuyCount,
    grid_sell_count: gridSellCount,
    grid_type: 'EqOffset',
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
    take_profit_price: undefined,
    trigger_price: undefined,
    stop_loss_price: undefined,
  } as GridBotContractParams;
  return { ...formattedParams };
}

function transformParams<T extends SwingVaultType>(
  swingType: T,
  params: CreateSwingVaultParams<T>,
) {
  let minPrice: string;
  let maxPrice: string;
  let gridAmount: number;
  let intervalPrice: string;
  if (swingType === 'classic') {
    const _params = params as CreateClassicSwingVaultParams;
    minPrice = _params.buyPrice;
    maxPrice = _params.sellPrice;
    gridAmount = 1;
    intervalPrice = '';
  } else {
    const _params = params as CreatePhasedSwingVaultParams;
    minPrice = _params.lowestSellPrice || '';
    maxPrice = _params.highestBuyPrice || '';
    gridAmount = _params.gridAmount;
    intervalPrice = _params.intervalPrice;
  }
  return { ...params, minPrice, maxPrice, gridAmount, intervalPrice };
}
