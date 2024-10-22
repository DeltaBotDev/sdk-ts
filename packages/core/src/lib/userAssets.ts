import { contractServices } from '@/services/contract';
import {
  BotContractServices,
  botContractServices,
  botNearContractServices,
  botSolanaContractServices,
} from '@/services/bot/contract';
import Big from 'big.js';
import { pairServices } from '@/services/token';
import { globalState } from '@/stores';

export interface NewToken extends BotModel.Token {
  refreshTime?: number;
}

export interface AccountAssetsResponse {
  tokens: NewToken[];
  balanceMap: Record<string, string>;
  totalBalancePrice: string;
  totalInternalBalancePrice: string;
  totalPrice: string;
}

export async function getAccountAssets(): Promise<AccountAssetsResponse> {
  const tokens: NewToken[] = await fetchTokens();
  const balanceMap = await fetchBalances(tokens);
  const internalBalanceMap = await fetchInternalBalances(tokens);
  const priceMap = (await pairServices.queryPrice()) || {};

  const totalBalancePrice = calculateTotalPrice(balanceMap, priceMap);
  const totalInternalBalancePrice = calculateTotalPrice(internalBalanceMap, priceMap);
  const totalPrice = new Big(totalBalancePrice).plus(totalInternalBalancePrice).toString();

  return {
    tokens,
    balanceMap,
    totalBalancePrice,
    totalInternalBalancePrice,
    totalPrice,
  };
}

export async function withdrawAccountAsset<ChainType extends Chain>(
  token: NewToken,
): Promise<ReturnType<BotContractServices<ChainType>['withdraw']>> {
  const chain = globalState.get('chain');
  const trans =
    chain === 'near'
      ? botNearContractServices.withdraw(token.code)
      : botSolanaContractServices.withdraw(token.code);
  return trans as ReturnType<BotContractServices<ChainType>['withdraw']>;
}

async function fetchTokens(): Promise<NewToken[]> {
  const res = await pairServices.query();
  return (
    res?.reduce((acc: NewToken[], cur) => {
      if (!acc.some((item) => item.code === cur.base_token.code)) acc.push(cur.base_token);
      if (!acc.some((item) => item.code === cur.quote_token.code)) acc.push(cur.quote_token);
      return acc;
    }, []) || []
  );
}

async function fetchBalances(tokens: NewToken[]): Promise<Record<string, string>> {
  const res = await Promise.all(
    tokens.map(async (token) => {
      const balance = await contractServices.getBalance(token.code);
      return { code: token.code, balance };
    }),
  );
  return res.reduce(
    (acc, cur) => {
      acc[cur.code] = cur.balance;
      return acc;
    },
    {} as Record<string, string>,
  );
}

async function fetchInternalBalances(tokens: NewToken[]): Promise<Record<string, string>> {
  const res = await Promise.all(
    tokens.map(async (token) => {
      const balance = await botContractServices.queryUserBalance(token.code, token.decimals);
      return { code: token.code, balance: balance || '0' };
    }),
  );
  return res.reduce(
    (acc, cur) => {
      acc[cur.code] = cur.balance;
      return acc;
    },
    {} as Record<string, string>,
  );
}

function calculateTotalPrice(
  balanceMap: Record<string, string>,
  priceMap: Record<string, string>,
): string {
  return Object.entries(balanceMap).reduce((acc, [code, balance]) => {
    const price = priceMap[code] || 0;
    return new Big(acc).plus(new Big(balance || 0).times(price)).toString();
  }, '0');
}
