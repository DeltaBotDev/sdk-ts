import { PairPrice, pairServices } from '@/services/token';
import { globalState } from '@/stores';
import type { BotModel } from '../types/bot';

const filterPairs = (pairs: BotModel.BotPair[], type?: BotModel.BotType) => {
  if (!type) return pairs;
  return pairs.filter(
    (pair) =>
      (type === 'dca' && pair.support_dca) ||
      (['grid', 'swing'].includes(type) && pair.support_grid),
  );
};

export async function getPairs(params?: { type?: BotModel.BotType }) {
  const chain = globalState.get('chain');
  const pairs = await pairServices.query(chain);
  return filterPairs(pairs, params?.type);
}

export async function getPairPrices(pairId: string[]): Promise<Record<string, PairPrice>> {
  const res = await pairServices.queryPairPrice(pairId);
  return res;
}
