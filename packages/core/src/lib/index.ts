import { GridBotContractParams } from '@/services/bot/contract';
import { globalState } from '@/stores';
import { validateDCAVaultParams, createDCAVault, type CreateDCAVaultParams } from './createVault';
import { getPairs, getPairPrices } from './pair';
import {
  claimNearGridVault,
  claimNearSwingVault,
  claimNearDCAVault,
  claimSolanaGridVault,
  claimSolanaSwingVault,
} from './claimVault';
import {
  closeNearGridVault,
  closeNearSwingVault,
  closeNearDCAVault,
  closeSolanaGridVault,
  closeSolanaSwingVault,
} from './closeVault';
import {
  getMyGridVaults,
  getMySwingVaults,
  getMyDCAVaults,
  getMarketGridVaults,
  getMarketSwingVaults,
  getMarketDCAVaults,
} from './vaultList';
import { getAccountAssets, withdrawAccountAsset } from './userAssets';

export type { CreateDCAVaultParams, GridBotContractParams };

export type Chain = 'near' | 'solana';
export type NetworkId = 'mainnet' | 'testnet';

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

  public validateDCAVaultParams = validateDCAVaultParams;
  public createDCAVault = createDCAVault<ChainType>;

  public getMyGridVaults = getMyGridVaults;
  public getMySwingVaults = getMySwingVaults;
  public getMyDCAVaults = getMyDCAVaults;
  public getMarketGridVaults = getMarketGridVaults;
  public getMarketSwingVaults = getMarketSwingVaults;
  public getMarketDCAVaults = getMarketDCAVaults;

  public getAccountAssets = getAccountAssets;
  public withdrawAccountAsset = withdrawAccountAsset;
}
