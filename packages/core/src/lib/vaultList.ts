import { botServices, marketServices } from '@/services/bot';
import { globalState } from '@/stores';

export interface MyVaultsParams {
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
  return {
    account_id: globalState.get('accountId'),
    status: params.status,
    pair_id: params.pairId,
    order_by: params.orderBy,
    dir: params.dir,
  };
}

export interface MarketVaultsParams {
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
  return {
    order_by: params.orderBy,
    dir: params.dir,
    pair_id: params.pairId,
    account_id: params.accountId,
  };
}
