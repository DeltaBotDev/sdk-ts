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
import { BotModel } from './types/bot';
import {
  initTokens,
  getTokenBySymbol,
  getTokenByAddress,
  getTokensByChain,
  getTokensBySymbol,
} from './stores/tokens';

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

export type { Chain, NetworkId };

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

export type VaultType = BotModel.BotType;

class TokensInitializer {
  private static instance: TokensInitializer;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): TokensInitializer {
    if (!TokensInitializer.instance) {
      TokensInitializer.instance = new TokensInitializer();
    }
    return TokensInitializer.instance;
  }

  public initialize(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = initTokens().catch((err) => {
        console.error('Error initializing tokens:', err);
        this.initPromise = null;
        throw err;
      });
    }
    return this.initPromise;
  }

  public reset(): void {
    this.initPromise = null;
  }

  public getPromise(): Promise<void> | null {
    return this.initPromise;
  }
}

export default class DeltaTradeSDK<ChainType extends Chain = Chain> {
  private initialized: boolean = false;
  private tokensInitializer: TokensInitializer;

  constructor({ chain, network, accountId, nearConfig, solanaConfig }: SDKParams<ChainType>) {
    globalState.set('chain', chain);
    globalState.set('network', network);
    globalState.set('accountId', accountId);
    globalState.set('nearConfig', nearConfig);
    globalState.set('solanaConfig', solanaConfig);

    this.initialized = true;
    this.tokensInitializer = TokensInitializer.getInstance();

    this.tokensInitializer.initialize().catch(() => {
      this.initialized = false;
    });
  }

  /**
   * @description Initialize the SDK environment
   * @example const sdk = DeltaTradeSDK.initEnv({ chain: 'near', network: 'mainnet',accountId: 'accountId' });
   */
  public static initEnv<ChainType extends Chain>(
    params: SDKParams<ChainType>,
  ): DeltaTradeSDK<ChainType> {
    const sdk = new DeltaTradeSDK(params);
    return sdk;
  }

  public changeEnv(params: Partial<SDKParams<Chain>>) {
    if (params.chain) globalState.set('chain', params.chain);
    if (params.network) globalState.set('network', params.network);
    if (params.accountId) globalState.set('accountId', params.accountId);

    this.tokensInitializer.reset();
    this.initTokens();
  }

  /**
   * Ensures tokens are initialized before executing operations
   */
  private async ensureTokensInitialized(): Promise<void> {
    try {
      await this.tokensInitializer.initialize();
      this.initialized = true;
    } catch (error) {
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Wraps a method to ensure tokens are initialized before execution
   * Used for all data fetching methods that require tokens data
   */
  private withTokensInit<T extends (...args: any[]) => any>(
    fn: T,
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      await this.ensureTokensInitialized();
      const result = await fn(...args);
      return result;
    };
  }

  /**
   * Manually initialize or refresh token data
   */
  public async initTokens() {
    this.initialized = true;
    try {
      this.tokensInitializer.reset();
      await this.tokensInitializer.initialize();
      return true;
    } catch (error) {
      this.initialized = false;
      console.error('Failed to initialize tokens:', error);
      return false;
    }
  }

  /**
   * Check if tokens are initialized
   */
  public isInitialized() {
    return this.initialized;
  }

  // Token methods - all require token initialization
  public getTokens = this.withTokensInit(getTokensByChain);
  public getTokenBySymbol = this.withTokensInit(getTokenBySymbol);
  public getTokenByAddress = this.withTokensInit(getTokenByAddress);
  public getTokensBySymbol = this.withTokensInit(getTokensBySymbol);

  // General methods - only get methods need tokens
  public getPairs = this.withTokensInit(getPairs);
  public getPairPrices = this.withTokensInit(getPairPrices);
  public getMarketInfo = this.withTokensInit(getMarketInfo);
  public getAccountAssets = this.withTokensInit(getAccountAssets);
  public withdrawAccountAsset = withdrawAccountAsset;
  public generateReferralUrl = generateReferralUrl;

  // Grid vault methods
  public validateGridVaultParams = validateGridVaultParams;
  public getGridMinDeposit = this.withTokensInit(getGridMinDeposit);
  public getGridTotalInvestment = this.withTokensInit(getGridTotalInvestment);
  public createGridVault = createGridVault<ChainType>;
  public claimGridVault = claimGridVault<ChainType>;
  public closeGridVault = closeGridVault<ChainType>;
  public getMyGridVaults = this.withTokensInit(getMyGridVaults);
  public getMarketGridVaults = this.withTokensInit(getMarketGridVaults);

  // Swing vault methods
  public validateSwingVaultParams = validateSwingVaultParams;
  public getSwingMinDeposit = this.withTokensInit(getSwingMinDeposit);
  public getSwingTotalInvestment = this.withTokensInit(getSwingTotalInvestment);
  public createClassicSwingVault: typeof createSwingVault<ChainType, 'classic'> = (...args) =>
    createSwingVault<ChainType, 'classic'>(...args);
  public createPhasedSwingVault: typeof createSwingVault<ChainType, 'phased'> = (...args) =>
    createSwingVault<ChainType, 'phased'>(...args);
  public claimSwingVault = claimGridVault<ChainType>;
  public closeSwingVault = closeGridVault<ChainType>;
  public getMySwingVaults = this.withTokensInit(getMySwingVaults);
  public getMarketSwingVaults = this.withTokensInit(getMarketSwingVaults);

  // DCA vault methods
  public validateDCAVaultParams = validateDCAVaultParams;
  public getDCAMinDeposit = this.withTokensInit(getDCAMinDeposit);
  public getDCATotalInvestment = this.withTokensInit(getDCATotalInvestment);
  public createDCAVault = createDCAVault<ChainType>;
  public claimDCAVault = claimDCAVault<ChainType>;
  public closeDCAVault = closeDCAVault<ChainType>;
  public getMyDCAVaults = this.withTokensInit(getMyDCAVaults);
  public getMarketDCAVaults = this.withTokensInit(getMarketDCAVaults);
}
