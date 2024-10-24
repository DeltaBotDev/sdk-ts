import {
  BotContractServices,
  botNearContractServices,
  botSolanaContractServices,
  GridBotContractParams,
} from '@/services/bot/contract';
import { globalState } from '@/stores';
import { parseDisplayAmount } from '@/utils/format';
import Big from 'big.js';
import { validateAccountId, getPair, getMinDeposit, getPairPrice } from '.';
import { Chain } from '../../types/contract';

export interface CreateGridVaultParams {
  pairId: string;
  minPrice: string;
  maxPrice: string;
  gridAmount: number;
  quantityPreGrid: string;
  name: string;
  validityPeriod?: number;
  slippage?: number;
  recommender?: string;
}

export async function validateGridVaultParams(params: CreateGridVaultParams) {
  validateAccountId();
  const errors: { [key: string]: string[] } = {};
  const pair = await getPair(params.pairId);
  if (!pair) errors.pair = ['Pair not found'];
  if (!params.minPrice) errors.minPrice = ['Min price is required'];
  if (!params.maxPrice) errors.maxPrice = ['Max price is required'];
  if (!params.gridAmount) errors.gridAmount = ['Grid amount is required'];
  if (!params.quantityPreGrid) errors.quantityPreGrid = ['Quantity pre grid is required'];
  if (params.slippage && (params.slippage < 0 || params.slippage > 100))
    errors.slippage = ['Slippage must be between 0 and 100'];
  if (!params.name) errors.name = ['Name is required'];
  if (new Big(params.minPrice).gte(params.maxPrice))
    errors.price = ['Min price must be less than max price'];
  if (Object.keys(errors).length > 0) {
    return errors;
  }
}

export async function getGridTotalInvestment(params: CreateGridVaultParams) {
  const { minPrice, maxPrice, gridAmount, quantityPreGrid } = params;
  if (!minPrice || !maxPrice || !gridAmount || !quantityPreGrid) return;
  const entryPrice = await getPairPrice(params.pairId);
  const roundDecimals = 6;
  const gridInfo: {
    buy: Big[];
    sell: Big[];
    wait: Big[];
  } = {
    buy: [],
    sell: [],
    wait: [],
  };

  const gridSpacing = new Big(maxPrice).minus(minPrice).div(gridAmount);

  for (let i = 0; i <= Number(gridAmount); i++) {
    const gridPrice = new Big(minPrice).plus(gridSpacing.times(i));
    if (new Big(minPrice).gt(gridPrice)) {
      gridInfo.buy.push(gridPrice);
    } else {
      gridInfo.sell.push(gridPrice);
    }
  }

  if (!gridInfo.buy.length && gridInfo.sell.length) {
    gridInfo.wait.push(gridInfo.sell.shift()!);
  } else if (!gridInfo.sell.length && gridInfo.buy.length) {
    gridInfo.wait.push(gridInfo.buy.pop()!);
  } else {
    const upperDiff = new Big(gridInfo.sell[0]).minus(entryPrice);
    const lowerDiff = new Big(entryPrice).minus(gridInfo.buy[gridInfo.buy.length - 1]);
    gridInfo.wait.push(upperDiff.gt(lowerDiff) ? gridInfo.buy.pop()! : gridInfo.sell.shift()!);
  }

  const baseInvestmentPerGrid = new Big(quantityPreGrid || 0);
  if (baseInvestmentPerGrid.eq(0)) return;

  const gridOffset = gridSpacing
    .div(new Big(1).div(baseInvestmentPerGrid))
    .round(roundDecimals, Big.roundUp)
    .toString();
  const firstBaseAmount = baseInvestmentPerGrid.round(roundDecimals, Big.roundUp).toString();
  const lastBaseAmount = firstBaseAmount;

  const firstQuoteAmount = baseInvestmentPerGrid
    .times(minPrice)
    .round(roundDecimals, Big.roundUp)
    .toString();
  const lastQuoteAmount = new Big(firstQuoteAmount)
    .plus(new Big(gridOffset).times(gridAmount))
    .round(roundDecimals, Big.roundUp)
    .toString();

  const gridBuyCount = gridInfo.buy.length;
  const gridSellCount = gridInfo.sell.length;

  const totalBaseInvestment = new Big(firstBaseAmount).times(gridSellCount).toString();
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

export async function getGridMinDeposit(params: CreateGridVaultParams) {
  const { minPrice, maxPrice } = params;
  const { minBaseDeposit, minQuoteDeposit } = await getMinDeposit(params.pairId, 'grid');
  if (new Big(minPrice || 0).eq(0) || new Big(maxPrice || 0).eq(0))
    return minBaseDeposit.toString() || '0';
  const result = Math.max(
    Number(minBaseDeposit || '0'),
    new Big(minQuoteDeposit || '0').div(minPrice).toNumber(),
  );
  const pair = await getPair(params.pairId);
  return parseDisplayAmount(result, pair?.base_token.symbol!, { rm: Big.roundUp });
}

export async function createGridVault<ChainType extends Chain>(
  params: CreateGridVaultParams,
): Promise<ReturnType<BotContractServices<ChainType>['createGridBot']>> {
  const errors = await validateGridVaultParams(params);
  if (errors) throw new Error(JSON.stringify(errors));
  const _params = await transformGridVaultParams(params);
  const chain = globalState.get('chain') as ChainType;
  const trans = await (chain === 'near'
    ? botNearContractServices.createGridBot({ ..._params, type: 'grid' })
    : botSolanaContractServices.createGridBot({ ..._params, type: 'grid' }));
  return trans as ReturnType<BotContractServices<ChainType>['createGridBot']>;
}

async function transformGridVaultParams(params: CreateGridVaultParams) {
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
  } = (await getGridTotalInvestment(params)) || {};
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

export async function claimGridVault<ChainType extends Chain>(params: {
  botId: number;
}): Promise<ReturnType<BotContractServices<ChainType>['claimGridBot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.claimGridBot(params.botId)
      : botSolanaContractServices.claimGridBot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['claimGridBot']>;
}

export async function closeGridVault<ChainType extends Chain>(params: {
  botId: number;
}): Promise<ReturnType<BotContractServices<ChainType>['closeGridBot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.closeGridBot(params.botId)
      : botSolanaContractServices.closeGridBot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['closeGridBot']>;
}
