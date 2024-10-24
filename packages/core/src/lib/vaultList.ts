import { botServices, marketServices } from '@/services/bot';
import { globalState } from '@/stores';
import type { BotModel } from '../types/bot';

export interface MyVaultsParams {
  page?: number;
  pageSize?: number;
  status?: 'position' | 'history';
  pairId?: string;
  orderBy?: string;
  dir?: 'asc' | 'desc';
}

export interface MyGridVault extends BotModel.MarketGridBot {}
export interface MySwingVault extends BotModel.MarketGridBot {}
export interface MyDCAVault extends BotModel.DCABot {}

export interface MyVaultsRes<T extends MyGridVault | MySwingVault | MyDCAVault> {
  list: T[];
  has_next_page: boolean;
}

export async function getMyGridVaults(params: MyVaultsParams) {
  const res = await botServices.query('grid', transformMyVaultListParams(params));
  return res as MyVaultsRes<MyGridVault>;
}

export async function getMySwingVaults(params: MyVaultsParams) {
  const res = await botServices.query('swing', transformMyVaultListParams(params));
  return res as MyVaultsRes<MySwingVault>;
}

export async function getMyDCAVaults(params: MyVaultsParams) {
  const res = await botServices.query('dca', transformMyVaultListParams(params));
  return res as MyVaultsRes<MyDCAVault>;
}

function transformMyVaultListParams(params: MyVaultsParams) {
  const { orderBy, dir, pairId, status, page, pageSize } = params;
  return {
    account_id: globalState.get('accountId'),
    status,
    pair_id: pairId,
    order_by: orderBy,
    dir,
    page,
    pageSize,
  };
}

export type MarketGridVault = BotModel.MarketGridBot;
export type MarketSwingVault = BotModel.MarketGridBot;
export type MarketDCAVault = BotModel.DCABot;
export interface MarketVaultsParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  dir?: 'asc' | 'desc';
  pairId?: string;
  accountId?: string;
}

export interface MarketVaultsRes<T extends MarketGridVault | MarketSwingVault | MarketDCAVault> {
  list: T[];
  has_next_page: boolean;
}

export async function getMarketGridVaults(params: MarketVaultsParams) {
  const res = await marketServices.queryAllBots({
    bot_type: 'grid',
    ...transformMarketVaultListParams(params),
  });
  return res as MarketVaultsRes<MarketGridVault>;
}

export async function getMarketSwingVaults(params: MarketVaultsParams) {
  const res = await marketServices.queryAllBots({
    bot_type: 'swing',
    ...transformMarketVaultListParams(params),
  });
  return res as MarketVaultsRes<MarketSwingVault>;
}

export async function getMarketDCAVaults(params: MarketVaultsParams) {
  const res = await marketServices.queryAllBots({
    bot_type: 'dca',
    ...transformMarketVaultListParams(params),
  });
  return res as MarketVaultsRes<MarketDCAVault>;
}

function transformMarketVaultListParams(params: MarketVaultsParams) {
  const { orderBy, dir, pairId, accountId, page, pageSize } = params;
  return {
    order_by: orderBy,
    dir,
    pair_id: pairId,
    account_id: accountId,
    page,
    pageSize,
  };
}
