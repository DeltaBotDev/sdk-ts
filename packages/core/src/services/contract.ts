import { getRPCNodeUrls } from '@/config/rpc';
import { formatAmount, formatFileUrl, parseAmount } from '@/utils/format';
import { getTokenAddress, getTokenByAddress, getTokenMeta } from '@/utils/token';
import { type Transaction } from '@near-wallet-selector/core';

import { connect, providers, keyStores, type Near } from 'near-api-js';
import type { QueryResponseKind } from 'near-api-js/lib/providers/provider';
import {
  Connection as solanaConnection,
  PublicKey,
  Transaction as solanaTransaction,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  createCloseAccountInstruction,
} from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { globalState } from '@/stores';
import { NetworkId, TokenMetadata } from '../types/contract';

export const NEAR_DECIMALS = 24;
export const NEAR_TGAS_DECIMALS = 12;

export const STORAGE_DEPOSIT_FEE = '1250000000000000000000';

export type TransactionParams = {
  contractId: string;
  actions: {
    method: string;
    args?: any;
    gas?: string;
    deposit?: string;
  }[];
};

export const contractServices = {
  getBalance(tokenAddress: string) {
    switch (globalState.get('chain')) {
      case 'near':
        return nearContractServices.getBalance(tokenAddress);
      case 'solana':
        return solanaContractServices.getBalance(tokenAddress);
    }
  },
};

export const nearContractServices = {
  getConnectionConfig(network = globalState.get('network')) {
    const rpcUrls =
      globalState.get('nearConfig')?.jsonRpcUrls || Object.values(getRPCNodeUrls('near', network));
    const nodeUrl = rpcUrls[0];
    const jsonRpcProvider = rpcUrls.map((url) => new providers.JsonRpcProvider({ url }));
    const provider = new providers.FailoverRpcProvider(jsonRpcProvider);
    return {
      networkId: network,
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl,
      provider,
      walletUrl: network === 'mainnet' ? 'https://app.near.org' : 'https://wallet.testnet.near.org',
      helperUrl:
        network === 'mainnet' ? 'https://helper.near.org' : 'https://helper.testnet.near.org',
      explorerUrl:
        network === 'mainnet' ? 'https://explorer.near.org' : 'https://explorer.testnet.near.org',
      indexerUrl:
        network === 'mainnet'
          ? 'https://near-api.deltatrade.ai'
          : 'https://testnet-api.deltatrade.ai',
    };
  },
  near: {} as Record<NetworkId, Near>,
  async connect(network = globalState.get('network')) {
    if (this.near[network]) return this.near[network];
    const near = await connect(this.getConnectionConfig(network));
    this.near[network] = near;
    return near;
  },
  async query<T = any>({
    contractId,
    method,
    args = {},
    network,
  }: {
    contractId: string;
    method: string;
    args?: any;
    gas?: string;
    deposit?: string;
    network?: NetworkId;
  }) {
    try {
      const { connection } = await this.connect(network);
      // console.log(`${method} args`, args);
      const res = await connection.provider.query({
        request_type: 'call_function',
        account_id: contractId,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
        finality: 'final',
      });
      const result = JSON.parse(
        Buffer.from((res as QueryResponseKind & { result: number[] }).result).toString(),
      ) as T;
      // console.log(`${method} result`, result);
      return result;
    } catch (error) {
      console.error(`${method} error`, error);
    }
  },
  async getNearBalance() {
    try {
      const accountId = globalState.get('accountId')!;
      const { connection } = await this.connect();
      const res = await connection.provider.query({
        request_type: 'view_account',
        account_id: accountId,
        finality: 'final',
      });
      const tokenMeta = await this.queryTokenMetadata(getTokenAddress('NEAR') || '');
      const amount = 'amount' in res ? (res.amount as string) : '0';
      const readableAmount = formatAmount(amount, tokenMeta?.decimals);
      return readableAmount;
    } catch (error) {
      return '0';
    }
  },

  /** get balance, if tokenAddress is undefined, get NEAR balance */
  async getBalance(address: string, decimals?: number) {
    try {
      if (address === getTokenAddress('NEAR')) {
        return this.getNearBalance();
      } else {
        const amount =
          (await this.query<string>({
            contractId: address,
            method: 'ft_balance_of',
            args: { account_id: globalState.get('accountId')! },
          })) || '0';
        const tokenMeta = await this.queryTokenMetadata(address);
        const readableAmount = formatAmount(amount, tokenMeta?.decimals);
        return readableAmount;
      }
    } catch (error) {
      console.error(error);
      return '0';
    }
  },

  tokenMeta: {} as Record<string, TokenMetadata>,
  async queryTokenMetadata<T extends string | string[]>(token: T) {
    if (!token?.length) return;
    const tokenArr = Array.isArray(token) ? token : [token];
    const tokensToQuery = tokenArr.filter((t) => !this.tokenMeta[t]);

    if (tokensToQuery.length > 0) {
      const res = await Promise.allSettled(
        tokensToQuery.map((token) =>
          this.query<TokenMetadata>({ contractId: token, method: 'ft_metadata' }),
        ),
      );

      const tokenMeta = res.reduce(
        (acc, token, index) => {
          if (token.status === 'fulfilled' && token.value) {
            const tokenMeta = token.value;
            if (tokenMeta.symbol === 'wNEAR') {
              tokenMeta.symbol = 'NEAR';
              tokenMeta.icon = formatFileUrl('/assets/crypto/near.svg');
            }
            acc[tokensToQuery[index]] = tokenMeta;
          }
          return acc;
        },
        {} as Record<string, TokenMetadata>,
      );

      Object.assign(this.tokenMeta, tokenMeta);
    }

    if (typeof token === 'string') {
      return this.tokenMeta[token] as T extends string ? TokenMetadata | undefined : never;
    }
    return (tokenArr.length ? this.tokenMeta : undefined) as T extends string
      ? TokenMetadata | undefined
      : Record<string, TokenMetadata> | undefined;
  },

  async transformTransactionActions(params: TransactionParams[]) {
    const accountId = globalState.get('accountId')!;
    const minGas = parseAmount(30, NEAR_TGAS_DECIMALS);
    const defaultGas = parseAmount(200 / params.length, NEAR_TGAS_DECIMALS);
    const result = [];
    for (const p of params) {
      const { contractId, actions } = p;
      const transaction: Transaction = {
        receiverId: contractId,
        signerId: accountId,
        actions: [],
      };
      for (const action of actions) {
        const { method, args = {}, gas = defaultGas, deposit = '0' } = action;
        const parsedArgs = JSON.parse(JSON.stringify(args));
        transaction.actions.push({
          type: 'FunctionCall',
          params: {
            methodName: method,
            args: parsedArgs,
            gas,
            deposit,
          },
        });
        // Call multiple methods from wNEAR contract
        // Swap NEAR to wNEAR, then transfer wNEAR to others
        if (method === 'ft_transfer_call' && parsedArgs.amount) {
          if (contractId === getTokenAddress('NEAR')) {
            transaction.actions.unshift({
              type: 'FunctionCall',
              params: {
                methodName: 'near_deposit',
                args: {},
                deposit: parsedArgs.amount,
                gas: minGas,
              },
            });
          }
          const storageDepositTransaction = await this.registerToken(contractId, accountId);

          if (storageDepositTransaction?.actions?.[0]) {
            transaction.actions.unshift({
              type: 'FunctionCall',
              params: {
                methodName: storageDepositTransaction.actions[0].method,
                args: storageDepositTransaction.actions[0].args,
                deposit: storageDepositTransaction.actions[0].deposit || STORAGE_DEPOSIT_FEE,
                gas: minGas,
              },
            });
          }
        }
      }
      if (transaction.actions.length) {
        result.push(transaction);
      }
    }
    console.log('transformTransactionActions', result);
    return result;
  },

  async registerToken(token: string, recipient?: string) {
    const res = await this.query<{
      available: string;
      total: string;
    }>({
      contractId: token,
      method: 'storage_balance_of',
      args: { account_id: recipient },
    });
    if (!res?.available) {
      return {
        contractId: token,
        actions: [
          {
            method: 'storage_deposit',
            args: { account_id: recipient, registration_only: true },
            deposit: STORAGE_DEPOSIT_FEE,
            gas: parseAmount(30, NEAR_TGAS_DECIMALS),
          },
        ],
      } as TransactionParams;
    }
  },
};

export const solanaContractServices = {
  solana: {} as Record<NetworkId, solanaConnection>,
  connect(network = globalState.get('network')) {
    if (this.solana[network]) return this.solana[network];
    const endPoint =
      globalState.get('solanaConfig')?.endpoint ||
      Object.values(getRPCNodeUrls('solana', network))[0];
    const connection = new solanaConnection(endPoint, { commitment: 'confirmed' });
    this.solana[network] = connection;
    return connection;
  },
  async getSolanaBalance() {
    try {
      const connection = this.connect();
      const publicKey = new PublicKey(globalState.get('accountId')!);
      const res = await connection.getBalance(publicKey!);
      return formatAmount(res, getTokenMeta('SOL')?.SolanaDecimals);
    } catch (error) {
      console.error(error);
      return '0';
    }
  },
  async getWrapSolanaBalance() {
    try {
      const connection = this.connect();
      const publicKey = new PublicKey(globalState.get('accountId')!);
      const tokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        publicKey!,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );
      const res = await connection.getTokenAccountBalance(tokenAccount);
      return formatAmount(res.value.amount, res.value.decimals);
    } catch (error) {
      return '0';
    }
  },
  async getBalance(tokenAddress: string) {
    try {
      if (getTokenByAddress(tokenAddress, 'solana')?.symbol === 'SOL')
        return this.getSolanaBalance();
      const connection = this.connect();
      const publicKey = new PublicKey(globalState.get('accountId')!);
      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenAddress),
        publicKey!,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );
      const res = await connection.getTokenAccountBalance(tokenAccount);
      return formatAmount(res.value.amount, res.value.decimals);
    } catch (error) {
      console.error(error);
      return '0';
    }
  },

  findProgramAddressSync(seeds: Buffer[], programId: PublicKey) {
    const res = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
    return res;
  },

  async convertSOL(type: 'wrap' | 'unwrap', amount: number | bigint) {
    const connection = this.connect();
    const publicKey = new PublicKey(globalState.get('accountId')!);

    // Get the associated token account address for the user's public key
    const associatedToken = await getAssociatedTokenAddress(
      NATIVE_MINT,
      publicKey!,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    const transaction = new solanaTransaction();
    // Check if the associated token account exists
    const accountInfo = await connection.getAccountInfo(associatedToken);
    if (type === 'wrap') {
      // Wrapping SOL to wSOL
      if (!accountInfo) {
        // Create the associated token account if it does not exist
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey!,
            associatedToken,
            publicKey!,
            NATIVE_MINT,
          ),
        );
      }

      // Transfer SOL to the associated token account and sync native token
      transaction.add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: associatedToken,
          lamports: amount,
        }),
        createSyncNativeInstruction(associatedToken, TOKEN_PROGRAM_ID),
      );
    } else if (type === 'unwrap') {
      // Unwrapping wSOL to SOL
      // if (!accountInfo) {
      //   throw new Error('Associated token account not found.');
      // }
      transaction.add(createCloseAccountInstruction(associatedToken, publicKey!, publicKey!));
    } else {
      throw new Error('Invalid type specified. Use "wrap" or "unwrap".');
    }

    return { transaction };
  },

  async approve(payerTokenAccount: PublicKey, delegate: PublicKey, amount: number | bigint) {
    const connection = this.connect();
    const ownerPublicKey = new PublicKey(globalState.get('accountId')!);
    const tokenAccountInfo = await getAccount(connection, payerTokenAccount);
    if (tokenAccountInfo.delegate?.equals(delegate) && tokenAccountInfo.delegatedAmount >= amount)
      return;
    console.log('approving');
    const transaction = createApproveInstruction(
      payerTokenAccount,
      delegate,
      ownerPublicKey!,
      amount,
    );
    return { transaction };
  },

  async createAssociatedTokenAccount(mint: PublicKey, owner: PublicKey) {
    const connection = this.connect();
    const publicKey = new PublicKey(globalState.get('accountId')!);
    const associatedAddress = await getAssociatedTokenAddress(mint, owner);
    const associatedAccount = await connection.getAccountInfo(associatedAddress);
    console.log('associatedAccount publicKey', mint);
    console.log('associatedAccount publicKey.toBase58()', mint.toBase58());
    console.log('associatedAccount', mint.toBase58(), associatedAccount);

    if (!associatedAccount) {
      const transaction = createAssociatedTokenAccountInstruction(
        publicKey!,
        associatedAddress,
        owner,
        mint,
      );
      return { transaction };
    }
  },
};
