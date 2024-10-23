import { PaginationParams } from '@/services';
import { botServices, marketServices } from '@/services/bot';
import { globalState } from '@/stores';

export interface MyVaultsParams extends PaginationParams {
  status?: 'position' | 'history';
  pairId?: string;
  orderBy?: string;
  dir?: 'asc' | 'desc';
}

export async function getMyGridVaults(params: MyVaultsParams) {
  const res = await botServices.query('grid', transformMyVaultListParams(params));
  return res;
}

export async function getMySwingVaults(params: MyVaultsParams) {
  const res = await botServices.query('swing', transformMyVaultListParams(params));
  return res;
}

export async function getMyDCAVaults(params: MyVaultsParams) {
  const res = await botServices.query('dca', transformMyVaultListParams(params));
  return res;
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

export interface MarketVaultsParams extends PaginationParams {
  orderBy?: string;
  dir?: 'asc' | 'desc';
  pairId?: string;
  accountId?: string;
}

export async function getMarketGridVaults(params: MarketVaultsParams) {
  const res = await marketServices.queryAllBots({
    bot_type: 'grid',
    ...transformMarketVaultListParams(params),
  });
  return (res || {}) as { list?: BotModel.MarketBot<'grid'>[]; has_next_page: boolean };
}

export async function getMarketSwingVaults(params: MarketVaultsParams) {
  const res = await marketServices.queryAllBots({
    bot_type: 'swing',
    ...transformMarketVaultListParams(params),
  });
  return (res || {}) as { list?: BotModel.MarketBot<'swing'>[]; has_next_page: boolean };
}

export async function getMarketDCAVaults(params: MarketVaultsParams) {
  const res = await marketServices.queryAllBots({
    bot_type: 'dca',
    ...transformMarketVaultListParams(params),
  });
  return (res || {}) as { list?: BotModel.MarketBot<'dca'>[]; has_next_page: boolean };
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
