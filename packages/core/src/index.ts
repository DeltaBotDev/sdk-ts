import { globalState } from '@/stores';
import { getPairs, getPairPrices } from './lib/pair';
import {
  getMyGridVaults,
  getMySwingVaults,
  getMyDCAVaults,
  getMarketGridVaults,
  getMarketSwingVaults,
  getMarketDCAVaults,
} from './lib/vaultList';
import { getAccountAssets, withdrawAccountAsset } from './lib/userAssets';
import { getMarketInfo } from './lib/market';
import { generateReferralUrl } from './lib/referral';
import {
  validateDCAVaultParams,
  getDCAMinDeposit,
  getDCATotalInvestment,
  createDCAVault,
  claimDCAVault,
  closeDCAVault,
} from './lib/vault/dca';
import {
  validateGridVaultParams,
  getGridMinDeposit,
  getGridTotalInvestment,
  createGridVault,
  claimGridVault,
  closeGridVault,
} from './lib/vault/grid';
import {
  createSwingVault,
  getSwingMinDeposit,
  getSwingTotalInvestment,
  validateSwingVaultParams,
} from './lib/vault/swing';
import type { NetworkId, Chain } from './types/contract';

export type { CreateGridVaultParams } from './lib/vault/grid';
export type {
  SwingVaultType,
  CreateSwingVaultParams,
  CreateClassicSwingVaultParams,
  CreatePhasedSwingVaultParams,
} from './lib/vault/swing';
export type { CreateDCAVaultParams } from './lib/vault/dca';

export type {
  MyVaultsParams,
  MarketVaultsParams,
  MyGridVault,
  MySwingVault,
  MyDCAVault,
  MarketDCAVault,
  MarketGridVault,
  MarketSwingVault,
  MarketVaultsRes,
  MyVaultsRes,
} from './lib/vaultList';

export interface SDKParams<ChainType extends Chain = Chain> {
  /** chain: 'near' | 'solana' */
  chain: ChainType;
  /** network: 'mainnet' | 'testnet' */
  network: NetworkId;
  /** accountId: current wallet account id */
  accountId?: string;
  /** nearConfig: near config */
  nearConfig?: {
    /** rpcUrls: near rpc urls */
    jsonRpcUrls?: string[];
  };
  /** solanaConfig: solana config */
  solanaConfig?: {
    /** rpcUrls: solana rpc endpoint */
    endpoint?: string;
  };
}

export default class DeltaTradeSDK<ChainType extends Chain = Chain> {
  constructor({ chain, network, accountId, nearConfig, solanaConfig }: SDKParams<ChainType>) {
    globalState.set('chain', chain);
    globalState.set('network', network);
    globalState.set('accountId', accountId);
    globalState.set('nearConfig', nearConfig);
    globalState.set('solanaConfig', solanaConfig);
  }

  /**
   * @description Initialize the SDK environment
   * @example const sdk = DeltaTradeSDK.initEnv({ chain: 'near', network: 'mainnet',accountId: 'accountId' });
   */
  public static initEnv<ChainType extends Chain>(
    params: SDKParams<ChainType>,
  ): DeltaTradeSDK<ChainType> {
    return new DeltaTradeSDK(params);
  }

  public changeEnv(params: Partial<SDKParams<Chain>>) {
    if (params.chain) globalState.set('chain', params.chain);
    if (params.network) globalState.set('network', params.network);
    if (params.accountId) globalState.set('accountId', params.accountId);
  }

  public getPairs = getPairs;
  public getPairPrices = getPairPrices;

  public validateGridVaultParams = validateGridVaultParams;
  public getGridMinDeposit = getGridMinDeposit;
  public getGridTotalInvestment = getGridTotalInvestment;
  public createGridVault = createGridVault<ChainType>;

  public validateSwingVaultParams = validateSwingVaultParams;
  public getSwingMinDeposit = getSwingMinDeposit;
  public getSwingTotalInvestment = getSwingTotalInvestment;
  public createClassicSwingVault = createSwingVault<ChainType, 'classic'>;
  public createPhasedSwingVault = createSwingVault<ChainType, 'phased'>;

  public validateDCAVaultParams = validateDCAVaultParams;
  public getDCAMinDeposit = getDCAMinDeposit;
  public getDCATotalInvestment = getDCATotalInvestment;
  public createDCAVault = createDCAVault<ChainType>;

  public claimGridVault = claimGridVault<ChainType>;
  public claimSwingVault = claimGridVault<ChainType>;
  public claimDCAVault = claimDCAVault<ChainType>;

  public closeGridVault = closeGridVault<ChainType>;
  public closeSwingVault = closeGridVault<ChainType>;
  public closeDCAVault = closeDCAVault<ChainType>;

  public getMyGridVaults = getMyGridVaults;
  public getMySwingVaults = getMySwingVaults;
  public getMyDCAVaults = getMyDCAVaults;
  public getMarketGridVaults = getMarketGridVaults;
  public getMarketSwingVaults = getMarketSwingVaults;
  public getMarketDCAVaults = getMarketDCAVaults;

  public getMarketInfo = getMarketInfo;

  public getAccountAssets = getAccountAssets;
  public withdrawAccountAsset = withdrawAccountAsset;

  public generateReferralUrl = generateReferralUrl;
}
