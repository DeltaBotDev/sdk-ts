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
import type { BotModel } from '../types/bot';
import { Chain } from '../types/contract';

export type AccountAssetsResponse = {
  token: BotModel.Token;
  price: string;
  balance: string;
  internalBalance: string;
}[];

export async function getAccountAssets(): Promise<AccountAssetsResponse> {
  const tokens = await fetchTokens();
  const balanceMap = await fetchBalances(tokens);
  const internalBalanceMap = await fetchInternalBalances(tokens);
  const priceMap = (await pairServices.queryPrice()) || {};

  const assetList = tokens.map((token) => ({
    token,
    price: priceMap[token.code] || '0',
    balance: balanceMap[token.code] || '0',
    internalBalance: internalBalanceMap[token.code] || '0',
  }));

  return assetList;
}

export async function withdrawAccountAsset<ChainType extends Chain>(
  tokenAddress: string,
): Promise<ReturnType<BotContractServices<ChainType>['withdraw']>> {
  const chain = globalState.get('chain');
  const trans =
    chain === 'near'
      ? botNearContractServices.withdraw(tokenAddress)
      : botSolanaContractServices.withdraw(tokenAddress);
  return trans as ReturnType<BotContractServices<ChainType>['withdraw']>;
}

async function fetchTokens(): Promise<BotModel.Token[]> {
  const res = await pairServices.query();
  return (
    res?.reduce((acc: BotModel.Token[], cur) => {
      if (!acc.some((item) => item.code === cur.base_token.code)) acc.push(cur.base_token);
      if (!acc.some((item) => item.code === cur.quote_token.code)) acc.push(cur.quote_token);
      return acc;
    }, []) || []
  );
}

async function fetchBalances(tokens: BotModel.Token[]): Promise<Record<string, string>> {
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

async function fetchInternalBalances(tokens: BotModel.Token[]): Promise<Record<string, string>> {
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
