import { botContractServices } from '@/services/bot/contract';
import { pairServices } from '@/services/token';
import { globalState } from '@/stores';
import type { BotModel } from '../../types/bot';

export function validateAccountId() {
  if (!globalState.get('accountId'))
    throw new Error('Please set accountId before creating a vault');
}

export async function getPair(pairId: string) {
  const pairs = await pairServices.query();
  const pair = pairs.find((p) => p.pair_id === pairId);
  return pair;
}

export async function getPairPrice(pairId: string) {
  const pairPriceRes = await pairServices.queryPairPrice(pairId);
  const { pairPrice: entryPrice } = pairPriceRes[pairId] || {};
  return entryPrice;
}

export async function getMinDeposit(pairId: string, type: BotModel.BotType) {
  const pair = await getPair(pairId);
  if (!pair) throw new Error('Pair not found');
  const minBaseDeposit = await botContractServices.queryMinDeposit(type, pair.base_token);
  const minQuoteDeposit = await botContractServices.queryMinDeposit(type, pair.quote_token);
  return { minBaseDeposit, minQuoteDeposit };
}
