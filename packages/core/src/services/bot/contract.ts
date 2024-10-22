import { formatAmount, parseAmount } from '@/utils/format';
import Big from 'big.js';
import {
  nearContractServices,
  NEAR_TGAS_DECIMALS,
  NEAR_DECIMALS,
  type TransactionParams,
  solanaContractServices,
} from './../contract';

import { getTokenAddress, getTokenByAddress, getTokenDecimals } from '@/utils/token';

import dayjs from '@/utils/dayjs';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { type Deltabot, IDL } from '../idl/deltabot';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { botServices } from '.';
import { SOLANA_MIN_DEPOSIT } from '@/config/bot';
import { pairServices } from '../token';
import { globalState } from '@/stores';
import { getConfigs } from '@/config';

export type BotContractServices<T extends Chain> = T extends 'near'
  ? typeof botNearContractServices
  : typeof botSolanaContractServices;

export type BotContractParams<T extends BotModel.BotType> = (T extends 'dca'
  ? DCABotContractParams
  : GridBotContractParams) & {
  type: T;
};
export interface GridBotContractParams {
  name: string;
  pair_id: string;
  grid_type: BotModel.GridType;
  grid_buy_count: number;
  grid_sell_count: number;
  /** Only for gridType EqOffset */
  grid_rate?: number;
  /** Only for gridType EqRate */
  first_base_amount: string;
  first_quote_amount: string;
  last_base_amount: string;
  last_quote_amount: string;
  fill_base_or_quote: boolean;
  trigger_price?: string;

  grid_offset?: string;
  slippage: number;
  entry_price: string;
  total_base_investment: string;
  total_quote_investment: string;
  base_token: BotModel.Token;
  quote_token: BotModel.Token;
  stop_loss_price?: string;
  valid_until_time?: string;
  take_profit_price?: string;
  recommender?: string;
}
export interface DCABotContractParams {
  name: string;
  token_in: string;
  token_out: string;
  single_amount_in: string;
  start_time: number;
  interval_time: number;
  count: number;
  lowest_price: string;
  highest_price: string;
  slippage: number;
  base_token: BotModel.Token;
  quote_token: BotModel.Token;
  total_base_investment: string;
  total_quote_investment: string;
  recommender?: string;
}

export type GridInfo = Partial<GridBotContractParams> & {
  buy: Big[];
  sell: Big[];
  wait: Big[];
};

export const BOT_PRICE_DECIMALS = 18;
export const DCA_PRICE_DECIMALS = 10;

export const botContractServices = {
  async queryMinDeposit(botType: BotModel.BotType, token: BotModel.Token) {
    const priceRes = await pairServices.queryPrice(token.code);
    const price = priceRes?.[token.code];
    // mini deposit = 10USD
    const minDepositByPrice = price ? new Big(10).div(price).round(8, Big.roundUp).toString() : '0';

    const minDepositByContract =
      globalState.get('chain') === 'near'
        ? await botNearContractServices.queryMinDeposit(botType, token)
        : await botSolanaContractServices.queryMinDeposit(botType, token);

    return new Big(minDepositByPrice || 0).gt(minDepositByContract || 0)
      ? minDepositByPrice
      : minDepositByContract;
  },

  async queryUserBalance(token: string, decimals?: number) {
    switch (globalState.get('chain')) {
      case 'near':
        return botNearContractServices.queryUserBalance(token, decimals);
      case 'solana':
        return botSolanaContractServices.queryUserBalance(token, decimals);
    }
  },

  queryBotStorageFee(gridCount: number) {
    switch (globalState.get('chain')) {
      case 'near':
        return botNearContractServices.queryBotStorageFee(gridCount);
      case 'solana':
        return botSolanaContractServices.queryBotStorageFee(gridCount);
    }
  },

  calculateGridInfo({
    min_price,
    max_price,
    grid_amount,
    quantityPreGrid,
    entry_price,
  }: Partial<BotModel.GridBotCreateParams> & {
    entry_price: string;
  }) {
    if (!min_price || !max_price || !grid_amount || !quantityPreGrid) return;

    const roundDecimals = 6;
    const gridInfo: GridInfo = { buy: [], sell: [], wait: [] };
    const gridOffset = new Big(max_price).minus(min_price).div(grid_amount);

    for (let i = 0; i <= Number(grid_amount); i++) {
      const gridPrice = new Big(min_price).plus(gridOffset.times(i));
      if (new Big(entry_price).gt(gridPrice)) {
        gridInfo.buy.push(gridPrice);
      } else {
        gridInfo.sell.push(gridPrice);
      }
    }

    // 处理等待价格
    if (!gridInfo.buy.length && gridInfo.sell.length) {
      gridInfo.wait.push(gridInfo.sell.shift()!);
    } else if (!gridInfo.sell.length && gridInfo.buy.length) {
      gridInfo.wait.push(gridInfo.buy.pop()!);
    } else {
      const upperDiff = new Big(gridInfo.sell[0]).minus(entry_price);
      const lowerDiff = new Big(entry_price).minus(gridInfo.buy[gridInfo.buy.length - 1]);
      gridInfo.wait.push(upperDiff.gt(lowerDiff) ? gridInfo.buy.pop()! : gridInfo.sell.shift()!);
    }

    const baseInvestmentPerGrid = new Big(quantityPreGrid || 0);
    if (baseInvestmentPerGrid.eq(0)) return gridInfo;

    gridInfo.grid_offset = gridOffset
      .div(new Big(1).div(baseInvestmentPerGrid))
      .round(roundDecimals, Big.roundUp)
      .toString();
    gridInfo.first_base_amount = baseInvestmentPerGrid.round(roundDecimals, Big.roundUp).toString();
    gridInfo.last_base_amount = gridInfo.first_base_amount;

    gridInfo.first_quote_amount = baseInvestmentPerGrid
      .times(min_price)
      .round(roundDecimals, Big.roundUp)
      .toString();
    gridInfo.last_quote_amount = new Big(gridInfo.first_quote_amount)
      .plus(new Big(gridInfo.grid_offset).times(grid_amount))
      .round(roundDecimals, Big.roundUp)
      .toString();

    gridInfo.grid_buy_count = gridInfo.buy.length;
    gridInfo.grid_sell_count = gridInfo.sell.length;

    gridInfo.total_base_investment = new Big(gridInfo.first_base_amount)
      .times(gridInfo.grid_sell_count)
      .toString();
    gridInfo.total_quote_investment = new Big(gridInfo.first_quote_amount)
      .times(gridInfo.grid_buy_count)
      .plus(
        new Big(gridInfo.grid_offset || 0)
          .times(gridInfo.grid_buy_count - 1)
          .times(gridInfo.grid_buy_count)
          .div(2),
      )
      .toString();

    gridInfo.entry_price = entry_price;

    return gridInfo;
  },

  calculateSwingInfo({
    swingType,
    min_price,
    max_price,
    grid_amount,
    intervalPrice,
    everyPhasedAmount,
    entry_price,
  }: Partial<BotModel.SwingBotCreateParams> & {
    entry_price: string;
  }) {
    if (
      (!min_price && !max_price) ||
      !grid_amount ||
      !everyPhasedAmount ||
      (grid_amount > 1 && !intervalPrice)
    )
      return;

    const roundDecimals = 6;
    const gridInfo: GridInfo = { buy: [], sell: [], wait: [] };

    const _intervalPrice =
      (min_price && max_price
        ? new Big(max_price)
            .minus(min_price)
            .abs()
            .div(grid_amount - 1 || 1)
            .toString()
        : intervalPrice) || '0';

    const minPrice =
      min_price ||
      new Big(max_price || 0).minus(new Big(_intervalPrice).times(grid_amount - 1)).toString();
    const maxPrice =
      max_price ||
      new Big(min_price || 0).plus(new Big(_intervalPrice).times(grid_amount - 1)).toString();

    for (let i = 0; i < Number(grid_amount); i++) {
      const gridPrice =
        swingType === 'buy'
          ? new Big(grid_amount === 1 ? minPrice : maxPrice).minus(new Big(_intervalPrice).times(i))
          : new Big(grid_amount === 1 ? maxPrice : minPrice).plus(new Big(_intervalPrice).times(i));
      swingType === 'buy' ? gridInfo.buy.push(gridPrice) : gridInfo.sell.push(gridPrice);
    }

    if (grid_amount === 1) {
      const waitPrice = swingType === 'buy' ? maxPrice : minPrice;
      waitPrice && gridInfo.wait.push(new Big(waitPrice));
    }

    const baseInvestmentPerGrid = new Big(everyPhasedAmount || 0);
    if (baseInvestmentPerGrid.eq(0)) return gridInfo;

    gridInfo.grid_offset = new Big(_intervalPrice)
      .div(new Big(1).div(baseInvestmentPerGrid))
      .round(roundDecimals, Big.roundUp)
      .toString();
    gridInfo.first_base_amount = baseInvestmentPerGrid.round(roundDecimals, Big.roundUp).toString();
    gridInfo.last_base_amount = gridInfo.first_base_amount;

    gridInfo.first_quote_amount = baseInvestmentPerGrid
      .times(minPrice)
      .round(roundDecimals, Big.roundUp)
      .toString();
    gridInfo.last_quote_amount = new Big(gridInfo.first_quote_amount)
      .plus(new Big(gridInfo.grid_offset).times(grid_amount - 1 || 1))
      .round(roundDecimals, Big.roundUp)
      .toString();

    gridInfo.grid_buy_count = gridInfo.buy.length;
    gridInfo.grid_sell_count = gridInfo.sell.length;

    gridInfo.total_base_investment = new Big(gridInfo.first_base_amount)
      .times(gridInfo.grid_sell_count)
      .toString();
    gridInfo.total_quote_investment = new Big(gridInfo.first_quote_amount)
      .times(gridInfo.grid_buy_count)
      .plus(
        new Big(gridInfo.grid_offset || 0)
          .times(gridInfo.grid_buy_count - 1)
          .times(gridInfo.grid_buy_count)
          .div(2),
      )
      .toString();

    gridInfo.entry_price = entry_price;

    return gridInfo;
  },

  calculateDCAInfo({ count, single_amount_in, tradeType }: Partial<BotModel.DCABotCreateParams>) {
    if (!count || !single_amount_in || !tradeType) return;
    const totalInvestment = new Big(single_amount_in).times(count).toString();
    const total_base_investment = tradeType === 'sell' ? totalInvestment : '0';
    const total_quote_investment = tradeType === 'buy' ? totalInvestment : '0';

    return {
      total_base_investment,
      total_quote_investment,
    };
  },
};

export const botNearContractServices = {
  async queryMinDeposit(botType: BotModel.BotType, token: BotModel.Token) {
    const result = await nearContractServices.query<string>({
      contractId: botType === 'dca' ? getConfigs().nearDCAContract : getConfigs().nearGridContract,
      method: 'query_min_deposit',
      args: { token: token.code },
    });
    const formattedResult = formatAmount(result, token.decimals);
    const multiplier = botType === 'dca' ? 1 : 1.5;
    return new Big(formattedResult || 0).times(multiplier).toString();
  },
  async createGridBot(
    params: GridBotContractParams & {
      type: BotModel.GridBotType;
    },
  ) {
    try {
      const {
        type,
        grid_type,
        grid_offset,
        grid_rate,
        trigger_price,
        take_profit_price,
        stop_loss_price,
        valid_until_time,
        first_base_amount,
        first_quote_amount,
        last_base_amount,
        last_quote_amount,
        entry_price,
        slippage,
        total_base_investment,
        total_quote_investment,
        base_token,
        quote_token,
        name,
        pair_id,
        fill_base_or_quote,
        grid_buy_count,
        grid_sell_count,
        recommender,
      } = params;

      const formattedParams = {
        grid_type,
        grid_offset:
          grid_type === 'EqOffset'
            ? parseAmount(
                grid_offset,
                fill_base_or_quote ? quote_token?.decimals : base_token?.decimals,
              )
            : '0',
        grid_rate: grid_type === 'EqRate' ? grid_rate : 0,
        trigger_price: parseAmount(trigger_price, BOT_PRICE_DECIMALS),
        take_profit_price: parseAmount(take_profit_price, BOT_PRICE_DECIMALS),
        stop_loss_price: parseAmount(stop_loss_price, BOT_PRICE_DECIMALS),
        valid_until_time,
        slippage: Number(parseAmount(slippage, 2)),
        first_base_amount: parseAmount(first_base_amount, base_token?.decimals),
        first_quote_amount: parseAmount(first_quote_amount, quote_token?.decimals),
        last_base_amount: parseAmount(last_base_amount, base_token?.decimals),
        last_quote_amount: parseAmount(last_quote_amount, quote_token?.decimals),
        entry_price: parseAmount(entry_price, BOT_PRICE_DECIMALS),
        name: type === 'swing' ? `[${type}]${name}` : name,
        pair_id,
        fill_base_or_quote,
        grid_buy_count,
        grid_sell_count,
        recommender,
      };

      const baseTokenBotRegisterTransaction = await this.getTokenBotRegisterTransaction(
        base_token.code,
        total_base_investment,
      );
      const quoteTokenBotRegisterTransaction = await this.getTokenBotRegisterTransaction(
        quote_token.code,
        total_quote_investment,
      );

      const baseTokenTransferTransaction = await this.getTokenTransferTransaction(
        base_token.code,
        total_base_investment,
      );
      const quoteTokenTransferTransaction = await this.getTokenTransferTransaction(
        quote_token.code,
        total_quote_investment,
      );

      const botStorageFee = this.queryBotStorageFee(grid_buy_count + grid_sell_count);

      const createBotDeposit = new Big(botStorageFee)
        .plus(
          base_token.symbol === 'NEAR'
            ? total_base_investment
            : quote_token.symbol === 'NEAR'
              ? total_quote_investment
              : 0,
        )
        .toString();

      const createBotTransactionAction = {
        contractId: getConfigs().nearGridContract,
        actions: [
          {
            method: 'create_bot',
            args: formattedParams,
            deposit: parseAmount(createBotDeposit, NEAR_DECIMALS),
            gas: parseAmount(300, NEAR_TGAS_DECIMALS),
          },
        ],
      };
      const transactions = [
        baseTokenBotRegisterTransaction,
        quoteTokenBotRegisterTransaction,
        baseTokenTransferTransaction,
        quoteTokenTransferTransaction,
        createBotTransactionAction,
      ].filter(Boolean) as TransactionParams[];

      return nearContractServices.transformTransactionActions(transactions);
    } catch (error) {
      console.error('createGridBot error', error);
      return Promise.reject(error);
    }
  },

  async createDCABot(params: DCABotContractParams) {
    try {
      const {
        base_token,
        quote_token,
        token_in,
        token_out,
        single_amount_in,
        start_time,
        interval_time,
        count,
        lowest_price,
        highest_price,
        slippage,
        total_base_investment,
        total_quote_investment,
        name,
        recommender,
      } = params;

      const tokenInMeta = getTokenByAddress(token_in);

      const formattedParams = {
        token_in,
        token_out,
        single_amount_in: parseAmount(single_amount_in, tokenInMeta?.decimals),
        start_time:
          start_time && dayjs(start_time).isAfter(dayjs().add(10, 'minute'))
            ? dayjs(start_time).valueOf()
            : dayjs().add(10, 'minute').valueOf(),
        interval_time,
        count: Number(count),
        lowest_price: Number(parseAmount(lowest_price, DCA_PRICE_DECIMALS)),
        highest_price: Number(parseAmount(highest_price, DCA_PRICE_DECIMALS)),
        slippage: Number(parseAmount(slippage, 2)),
        name,
        recommender,
      };

      const baseTokenRegisterTransaction = await this.getTokenBotRegisterTransaction(
        base_token.code,
        total_base_investment,
        getConfigs().nearDCAContract,
      );
      const quoteTokenBotRegisterTransaction = await this.getTokenBotRegisterTransaction(
        quote_token.code,
        total_quote_investment,
        getConfigs().nearDCAContract,
      );

      const baseTokenTransferTransaction = await this.getTokenTransferTransaction(
        base_token.code,
        total_base_investment,
        getConfigs().nearDCAContract,
      );
      const quoteTokenTransferTransaction = await this.getTokenTransferTransaction(
        quote_token.code,
        total_quote_investment,
        getConfigs().nearDCAContract,
      );

      const createBotDeposit = '0.01';

      const createBotTransactionAction = {
        contractId: getConfigs().nearDCAContract,
        actions: [
          {
            method: 'create_dca',
            args: formattedParams,
            deposit: parseAmount(createBotDeposit, NEAR_DECIMALS),
            gas: parseAmount(300, NEAR_TGAS_DECIMALS),
          },
        ],
      };
      const transactions = [
        baseTokenRegisterTransaction,
        quoteTokenBotRegisterTransaction,
        baseTokenTransferTransaction,
        quoteTokenTransferTransaction,
        createBotTransactionAction,
      ].filter(Boolean) as TransactionParams[];

      return nearContractServices.transformTransactionActions(transactions);
    } catch (error) {
      console.error('createDCABot error', error);
      return Promise.reject(error);
    }
  },

  async getTokenBotRegisterTransaction(
    tokenAddress: string,
    totalInvestment: string,
    contractId = getConfigs().nearGridContract,
  ) {
    if (new Big(totalInvestment).eq(0)) return;
    const isRegistered = await nearContractServices.query<boolean>({
      contractId,
      method: 'query_user_token_registered',
      args: { token: tokenAddress, user: globalState.get('accountId') },
    });
    if (!isRegistered) {
      return {
        contractId,
        actions: [
          {
            method: 'token_storage_deposit',
            args: { token: tokenAddress, user: globalState.get('accountId') },
            deposit: parseAmount(0.02),
          },
        ],
      } as TransactionParams;
    }
  },

  async getTokenTransferTransaction(
    tokenAddress: string,
    totalInvestment: string,
    receiverId = getConfigs().nearGridContract,
  ) {
    const tokenMeta = getTokenByAddress(tokenAddress);
    if (!tokenMeta) return;
    // Skip NEAR token transfer to bot contract, because it's not necessary
    if (receiverId === getConfigs().nearGridContract && tokenMeta.symbol === 'NEAR') return;
    if (new Big(totalInvestment).gt(0)) {
      return {
        contractId: tokenAddress,
        actions: [
          {
            method: 'ft_transfer_call',
            args: {
              amount: parseAmount(totalInvestment, tokenMeta?.decimals),
              receiver_id: receiverId,
              msg: '',
            },
            deposit: '1',
          },
        ],
      } as TransactionParams;
    } else {
      const storageDepositTransaction = await nearContractServices.registerToken(tokenAddress);
      return storageDepositTransaction;
    }
  },

  queryBotStorageFee(gridCount: number) {
    //0.02 + 0.0036*(countBuy + countSell)
    return new Big(0.02).plus(new Big(0.004).times(gridCount)).toString();
  },

  async claimGridBot(id: number) {
    const transactions = [
      {
        contractId: getConfigs().nearGridContract,
        actions: [
          {
            method: 'claim',
            args: { bot_id: 'GRID:' + id },
            deposit: '1',
          },
        ],
      },
    ];
    return nearContractServices.transformTransactionActions(transactions);
  },

  async claimDCABot(id: string) {
    const transactions = [
      {
        contractId: getConfigs().nearDCAContract,
        actions: [
          {
            method: 'claim',
            args: { vault_id: id },
            deposit: '1',
          },
        ],
      },
    ];
    return nearContractServices.transformTransactionActions(transactions);
  },

  async closeGridBot(bot_id: number) {
    const transactions = [
      {
        contractId: getConfigs().nearGridContract,
        actions: [
          {
            method: 'close_bot',
            args: { bot_id: 'GRID:' + bot_id.toString() },
            deposit: '1',
            gas: parseAmount(300, NEAR_TGAS_DECIMALS),
          },
        ],
      },
    ];
    return nearContractServices.transformTransactionActions(transactions);
  },
  async closeDCABot(dca_id: string) {
    const transactions = [
      {
        contractId: getConfigs().nearDCAContract,
        actions: [
          {
            method: 'close_dca',
            args: { vault_id: dca_id },
            deposit: '1',
            gas: parseAmount(300, NEAR_TGAS_DECIMALS),
          },
        ],
      },
    ];
    return nearContractServices.transformTransactionActions(transactions);
  },
  async queryUserBalance(token: string, decimals?: number) {
    const accountId = globalState.get('accountId');
    const [res1, res2] = await Promise.all(
      [getConfigs().nearGridContract, getConfigs().nearDCAContract].map(async (contractId) => {
        return nearContractServices.query<string>({
          contractId,
          method: 'query_user_balance',
          args: { user: accountId, token },
        });
      }),
    );
    const total = new Big(res1 || 0).plus(res2 || 0).toString();
    return formatAmount(total, decimals || getTokenByAddress(token)?.decimals);
  },
  async withdraw(token: string) {
    const accountId = globalState.get('accountId');
    const [res1, res2] = await Promise.all(
      [getConfigs().nearGridContract, getConfigs().nearDCAContract].map(async (contractId) => {
        const amount = await nearContractServices.query<string>({
          contractId,
          method: 'query_user_balance',
          args: { user: accountId, token },
        });
        return { contractId, amount };
      }),
    );
    const transactions = [res1, res2]
      .filter((item) => new Big(item.amount || 0).gt(0))
      .map((item) => ({
        contractId: item.contractId,
        actions: [
          {
            method: 'withdraw',
            args: { token },
            deposit: '1',
          },
        ],
      }));
    return nearContractServices.transformTransactionActions(transactions);
  },
};

const SOLANA_BOT_PRICE_DECIMALS = 10;

export const botSolanaContractServices = {
  createProgram() {
    const connection = solanaContractServices.connect();
    const programId = new PublicKey(getConfigs().solanaGridContract);
    const program = new anchor.Program<Deltabot>(IDL, programId, { connection });
    return program;
  },
  async createGridBot(
    params: GridBotContractParams & {
      type: BotModel.GridBotType;
    },
  ) {
    console.log('createGridBot params', params);
    const baseTokenDecimals = getTokenDecimals(params.base_token.symbol, 'solana');
    const quoteTokenDecimals = getTokenDecimals(params.quote_token.symbol, 'solana');
    const {
      name,
      slippage,
      grid_type,
      grid_rate,
      grid_offset,
      first_base_amount,
      first_quote_amount,
      last_base_amount,
      last_quote_amount,
      fill_base_or_quote,
      trigger_price,
      take_profit_price,
      stop_loss_price,
      valid_until_time,
      entry_price,
      base_token,
      quote_token,
      total_base_investment,
      total_quote_investment,
      grid_buy_count,
      grid_sell_count,
      recommender,
    } = {
      ...params,
      grid_type: params.grid_type === 'EqOffset' ? 0 : 1,
      grid_offset: new anchor.BN(
        params.grid_type === 'EqOffset'
          ? parseAmount(
              params.grid_offset,
              params.fill_base_or_quote ? quoteTokenDecimals : baseTokenDecimals,
            )
          : '0',
      ),
      grid_rate: (params.grid_type === 'EqRate' ? params.grid_rate : 0) ?? 0,
      trigger_price: new anchor.BN(parseAmount(params.trigger_price, SOLANA_BOT_PRICE_DECIMALS)),
      take_profit_price: new anchor.BN(
        parseAmount(params.take_profit_price, SOLANA_BOT_PRICE_DECIMALS),
      ),
      stop_loss_price: new anchor.BN(
        parseAmount(params.stop_loss_price, SOLANA_BOT_PRICE_DECIMALS),
      ),
      valid_until_time: new anchor.BN(params.valid_until_time || 0),
      slippage: Number(parseAmount(params.slippage, 2)),
      first_base_amount: new anchor.BN(parseAmount(params.first_base_amount, baseTokenDecimals)),
      first_quote_amount: new anchor.BN(parseAmount(params.first_quote_amount, quoteTokenDecimals)),
      last_base_amount: new anchor.BN(parseAmount(params.last_base_amount, baseTokenDecimals)),
      last_quote_amount: new anchor.BN(parseAmount(params.last_quote_amount, quoteTokenDecimals)),
      entry_price: new anchor.BN(parseAmount(params.entry_price, SOLANA_BOT_PRICE_DECIMALS)),
      name: params.type === 'swing' ? `[${params.type}]${params.name}` : params.name,
      fill_base_or_quote: params.fill_base_or_quote,
      total_base_investment: parseAmount(params.total_base_investment, baseTokenDecimals),
      total_quote_investment: parseAmount(params.total_quote_investment, quoteTokenDecimals),
    };

    const userPublicKey = new PublicKey(globalState.get('accountId')!);
    if (!userPublicKey) return Promise.reject('No user public key');

    const baseTokenPublicKey = new PublicKey(getTokenAddress(base_token.symbol, 'solana')!);
    const quoteTokenPublicKey = new PublicKey(getTokenAddress(quote_token.symbol, 'solana')!);
    const program = this.createProgram();
    const userStatePDA = this.getUserStatePDA(program, userPublicKey);

    const pairPDA = this.getPairAccountPDA(program, baseTokenPublicKey, quoteTokenPublicKey);
    const gridBotState = new PublicKey(getConfigs().solanaGridBotState);
    console.log('createBot query start');
    const [
      baseGlobalBalanceInfo,
      quoteGlobalBalanceInfo,
      baseDepositLimitAccountPDA,
      quoteDepositLimitAccountPDA,
      { nextUserBotId },
    ] = await Promise.all([
      this.getGlobalBalanceInfo(program, baseTokenPublicKey),
      this.getGlobalBalanceInfo(program, quoteTokenPublicKey),
      this.getDepositLimitAccountPDA(program, baseTokenPublicKey),
      this.getDepositLimitAccountPDA(program, quoteTokenPublicKey),

      this.getNextBotId(program, userPublicKey),
    ]);
    console.log('createBot query finished');
    const gridBotPDA = this.getGridBotAccountPDA(program, userPublicKey, nextUserBotId);

    const [userBaseTokenAccount, userQuoteTokenAccount] = await Promise.all([
      getAssociatedTokenAddress(baseTokenPublicKey, userPublicKey),
      getAssociatedTokenAddress(quoteTokenPublicKey, userPublicKey),
    ]);
    const [referralRecordPDA] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from('referral_record'),
        new PublicKey(getConfigs().solanaGridBotState).toBuffer(),
        userPublicKey.toBuffer(),
      ],
      program.programId,
    );

    const createBotInstruction = program.methods
      .createBot(
        name,
        grid_type,
        grid_rate,
        grid_offset,
        first_base_amount,
        first_quote_amount,
        last_base_amount,
        last_quote_amount,
        fill_base_or_quote,
        valid_until_time,
        entry_price,
        recommender ? new PublicKey(recommender) : null,
      )
      .accounts({
        gridBotState: gridBotState,
        userState: userStatePDA,
        baseMint: baseTokenPublicKey,
        quoteMint: quoteTokenPublicKey,
        pair: pairPDA,
        gridBot: gridBotPDA,
        globalBalanceBaseUser: baseGlobalBalanceInfo.user,
        globalBalanceBase: baseGlobalBalanceInfo.tokenAccount,

        globalBalanceQuoteUser: quoteGlobalBalanceInfo.user,
        globalBalanceQuote: quoteGlobalBalanceInfo.tokenAccount,

        depositLimitBase: baseDepositLimitAccountPDA,
        depositLimitQuote: quoteDepositLimitAccountPDA,

        userBaseTokenAccount: userBaseTokenAccount,
        userQuoteTokenAccount: userQuoteTokenAccount,

        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        referralRecord: referralRecordPDA,
        user: userPublicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const [
      baseTokenWrapOrCreateTransaction,
      quoteTokenWrapOrCreateTransaction,
      createBotAccountTransaction,
      createBotTransaction,
    ] = await Promise.all([
      base_token.symbol === 'SOL'
        ? solanaContractServices.convertSOL('wrap', BigInt(total_base_investment))
        : solanaContractServices.createAssociatedTokenAccount(baseTokenPublicKey, userPublicKey),
      quote_token.symbol === 'SOL'
        ? solanaContractServices.convertSOL('wrap', BigInt(total_quote_investment))
        : solanaContractServices.createAssociatedTokenAccount(quoteTokenPublicKey, userPublicKey),
      this.getCreateBotAccountTransaction(program, userPublicKey, grid_sell_count, grid_buy_count),
      createBotInstruction,
    ]);
    const transactions = [
      baseTokenWrapOrCreateTransaction?.transaction,
      quoteTokenWrapOrCreateTransaction?.transaction,
      createBotAccountTransaction,
      createBotTransaction,
    ].filter(Boolean) as anchor.web3.TransactionInstruction[];

    return transactions;
  },
  async createDCABot(params: DCABotContractParams) {
    throw Error('Not implemented');
  },
  async claimGridBot(id: number) {
    const { userStateId } = this.transformIds(id);
    const userPublicKey = new PublicKey(globalState.get('accountId')!);
    if (!userPublicKey) return Promise.reject('No user public key');
    const bot = await botServices.queryDetail('grid', id);
    if (!bot) return Promise.reject('No bot found');
    const program = this.createProgram();
    const gridBotPDA = this.getGridBotAccountPDA(program, userPublicKey, userStateId);
    const baseTokenPublicKey = new PublicKey(bot?.base_token.code);
    const quoteTokenPublicKey = new PublicKey(bot?.quote_token.code);

    const gridBotState = new PublicKey(getConfigs().solanaGridBotState);
    const pairPDA = this.getPairAccountPDA(program, baseTokenPublicKey, quoteTokenPublicKey);
    // const userStatePDA = this.getUserStatePDA(program, userPublicKey);

    const [
      baseGlobalBalanceInfo,
      quoteGlobalBalanceInfo,
      userBaseTokenAccount,
      userQuoteTokenAccount,
    ] = await Promise.all([
      this.getGlobalBalanceInfo(program, baseTokenPublicKey),
      this.getGlobalBalanceInfo(program, quoteTokenPublicKey),
      getAssociatedTokenAddress(baseTokenPublicKey, userPublicKey),
      getAssociatedTokenAddress(quoteTokenPublicKey, userPublicKey),
    ]);

    const [baseCreateAccountTransaction, quoteCreateAccountTransaction, claimBotTransaction] =
      await Promise.all([
        solanaContractServices.createAssociatedTokenAccount(baseTokenPublicKey, userPublicKey),
        solanaContractServices.createAssociatedTokenAccount(quoteTokenPublicKey, userPublicKey),
        program.methods
          .claim({
            userStateId,
            globalBaseBump: baseGlobalBalanceInfo.bump,
            globalQuoteBump: quoteGlobalBalanceInfo.bump,
          })
          .accounts({
            gridBotState: gridBotState,
            pair: pairPDA,
            gridBot: gridBotPDA,
            globalBalanceBaseUser: baseGlobalBalanceInfo.user,
            globalBalanceBase: baseGlobalBalanceInfo.tokenAccount,
            globalBalanceQuoteUser: quoteGlobalBalanceInfo.user,
            globalBalanceQuote: quoteGlobalBalanceInfo.tokenAccount,
            user: userPublicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            userBaseTokenAccount,
            userQuoteTokenAccount,
            baseMint: baseTokenPublicKey,
            quoteMint: quoteTokenPublicKey,
          })
          .instruction(),
      ]);

    const transactions = [
      baseCreateAccountTransaction?.transaction,
      quoteCreateAccountTransaction?.transaction,
      claimBotTransaction,
    ].filter(Boolean) as anchor.web3.TransactionInstruction[];
    return transactions;
  },
  async claimDCABot(id: string) {
    return Promise.reject('Not implemented');
  },
  async closeGridBot(id: number) {
    const { userStateId } = this.transformIds(id);
    const userPublicKey = new PublicKey(globalState.get('accountId')!);
    if (!userPublicKey) return Promise.reject('No user public key');
    const program = this.createProgram();
    const gridBotPDA = this.getGridBotAccountPDA(program, userPublicKey, userStateId);
    const botInfo = await program.account.gridBot.fetch(gridBotPDA);
    if (!botInfo) return Promise.reject('No bot found');
    const [baseToken, quoteToken] = botInfo.pairId.split(':');
    const baseTokenPublicKey = new PublicKey(baseToken);
    const quoteTokenPublicKey = new PublicKey(quoteToken);

    console.log('totalBaseAmount', botInfo.totalBaseAmount.toNumber());
    console.log('totalQuoteAmount', botInfo.totalQuoteAmount.toNumber());

    const gridBotState = new PublicKey(getConfigs().solanaGridBotState);
    const pairPDA = this.getPairAccountPDA(program, baseTokenPublicKey, quoteTokenPublicKey);

    const [
      baseGlobalBalanceInfo,
      quoteGlobalBalanceInfo,
      userBaseTokenAccount,
      userQuoteTokenAccount,
    ] = await Promise.all([
      this.getGlobalBalanceInfo(program, baseTokenPublicKey),
      this.getGlobalBalanceInfo(program, quoteTokenPublicKey),
      getAssociatedTokenAddress(baseTokenPublicKey, userPublicKey),
      getAssociatedTokenAddress(quoteTokenPublicKey, userPublicKey),
    ]);

    const [
      baseCreateAccountTransaction,
      quoteCreateAccountTransaction,
      closeBotTransaction,
      unwrapBaseTransaction,
      unwrapQuoteTransaction,
    ] = await Promise.all([
      solanaContractServices.createAssociatedTokenAccount(baseTokenPublicKey, userPublicKey),
      solanaContractServices.createAssociatedTokenAccount(quoteTokenPublicKey, userPublicKey),
      program.methods
        .closeBot({
          userStateId: userStateId,
          globalBaseBump: baseGlobalBalanceInfo.bump,
          globalQuoteBump: quoteGlobalBalanceInfo.bump,
        })
        .accounts({
          gridBotState: gridBotState,
          pair: pairPDA,
          gridBot: gridBotPDA,
          globalBalanceBaseUser: baseGlobalBalanceInfo.user,
          globalBalanceBase: baseGlobalBalanceInfo.tokenAccount,
          globalBalanceQuoteUser: quoteGlobalBalanceInfo.user,
          globalBalanceQuote: quoteGlobalBalanceInfo.tokenAccount,
          user: userPublicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          baseMint: baseTokenPublicKey,
          quoteMint: quoteTokenPublicKey,
          userBaseTokenAccount,
          userQuoteTokenAccount,
        })
        .instruction(),
      getTokenByAddress(baseToken)?.symbol === 'SOL'
        ? solanaContractServices.convertSOL('unwrap', BigInt(botInfo.totalBaseAmount.toNumber()))
        : undefined,
      getTokenByAddress(quoteToken)?.symbol === 'SOL'
        ? solanaContractServices.convertSOL('unwrap', BigInt(botInfo.totalQuoteAmount.toNumber()))
        : undefined,
    ]);
    const transactions = [
      baseCreateAccountTransaction?.transaction,
      quoteCreateAccountTransaction?.transaction,
      closeBotTransaction,
      unwrapBaseTransaction?.transaction,
      unwrapQuoteTransaction?.transaction,
    ].filter(Boolean) as anchor.web3.TransactionInstruction[];

    return transactions;
  },
  async closeDCABot(dca_id: string) {
    return Promise.reject('Not implemented');
  },
  async queryUserBalance(token: string, decimals?: number) {
    return;
  },
  async withdraw(token: string) {
    return;
  },
  queryBotStorageFee(gridCount: number) {
    return '0';
  },
  async queryMinDeposit(botType: BotModel.BotType, token: BotModel.Token) {
    return SOLANA_MIN_DEPOSIT[token.symbol as keyof typeof SOLANA_MIN_DEPOSIT];
  },
  transformIds(id: number) {
    const res = String(id).match(/^(\d+)(\d{9})$/);
    if (!res) throw new Error('Invalid bot id');
    return {
      botId: Number(res[1]),
      userStateId: Number(res[2]),
    };
  },
  async getCreateBotAccountTransaction(
    program: anchor.Program<Deltabot>,
    user: anchor.web3.PublicKey,
    grid_sell_count: number,
    grid_buy_count: number,
  ) {
    console.log('getCreateBotAccountTransaction start');
    const { nextUserBotId } = await this.getNextBotId(program, user);
    const gridBotState = new PublicKey(getConfigs().solanaGridBotState);
    const userStatePDA = this.getUserStatePDA(program, user);

    const gridBot = this.getGridBotAccountPDA(program, user, nextUserBotId);
    console.log('getCreateBotAccountTransaction', {
      nextUserBotId,
      gridBotState: gridBotState.toString(),
      userState: userStatePDA.toString(),
      gridBot: gridBot.toString(),
      user,
      systemProgram: anchor.web3.SystemProgram.programId,
    });
    const res = await program.methods
      .createBotAccount(grid_sell_count, grid_buy_count)
      .accounts({
        gridBotState: gridBotState,
        userState: userStatePDA,
        gridBot: gridBot,
        user,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();
    console.log('getCreateBotAccountTransaction finished', res);
    return res;
  },

  getPairAccountPDA(
    program: anchor.Program<Deltabot>,
    baseToken: anchor.web3.PublicKey,
    quoteToken: anchor.web3.PublicKey,
  ) {
    const [pda] = solanaContractServices.findProgramAddressSync(
      [
        new PublicKey(getConfigs().solanaGridBotState).toBuffer(),
        baseToken.toBuffer(),
        quoteToken.toBuffer(),
      ],
      program.programId,
    );
    return pda;
  },
  getUserStatePDA(program: anchor.Program<Deltabot>, user: anchor.web3.PublicKey) {
    const [pda] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from('user_state'),
        new PublicKey(getConfigs().solanaGridBotState).toBuffer(),
        user.toBuffer(),
      ],
      program.programId,
    );
    return pda;
  },
  async getNextBotId(program: anchor.Program<Deltabot>, user: anchor.web3.PublicKey) {
    let nextUserBotId = 0;
    const userStatePDA = this.getUserStatePDA(program, user);
    try {
      const accountInfo = await program.account.userState.fetch(userStatePDA);
      if (accountInfo) {
        nextUserBotId = accountInfo.nextUserBotId;
        console.log('nextUserBotId:', nextUserBotId);
        return { nextUserBotId, exists: true };
      }
      console.log('nextUserBotId:', nextUserBotId);
    } catch (error) {
      console.log('getNextBotId error', error);
    }
    return { nextUserBotId, exists: false };
  },
  getGridBotAccountPDA(
    program: anchor.Program<Deltabot>,
    user: anchor.web3.PublicKey,
    nextUserBotId: number,
  ) {
    // user.key().as_ref(), &grid_bot_state.next_bot_id.to_be_bytes()
    const nextUserBotIdBuffer = Buffer.alloc(4); // 4 bytes for a 32-bit integer
    nextUserBotIdBuffer.writeUInt32BE(nextUserBotId);
    const [pda] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from('user_grid_bot'),
        new PublicKey(getConfigs().solanaGridBotState).toBuffer(),
        user.toBuffer(),
        nextUserBotIdBuffer,
      ],
      program.programId,
    );
    console.log('getGridBotAccountPDA finished');
    return pda;
  },

  async getGlobalBalanceInfo(program: anchor.Program<Deltabot>, token: anchor.web3.PublicKey) {
    console.log('in registerGlobalBalance token:' + token.toString());
    const [globalBalUserPDA, globalBalUserBump] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from('global_balance_user'),
        new PublicKey(getConfigs().solanaGridBotState).toBuffer(),
        token.toBuffer(),
      ],
      program.programId,
    );
    const globalBalTokenAccount = await getAssociatedTokenAddress(
      token,
      globalBalUserPDA,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    return {
      user: globalBalUserPDA,
      bump: globalBalUserBump,
      tokenAccount: globalBalTokenAccount,
    };
  },

  getDepositLimitAccountPDA(program: anchor.Program<Deltabot>, token: anchor.web3.PublicKey) {
    const [pda, bump] = solanaContractServices.findProgramAddressSync(
      [
        Buffer.from('deposit_limit'),
        new PublicKey(getConfigs().solanaGridBotState).toBuffer(),
        token.toBuffer(),
      ],
      program.programId,
    );
    return pda;
  },
};
