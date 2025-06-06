import { Chain, TokenMetadata } from './contract';

export namespace BotModel {
  export interface Token {
    id: number;
    code: string;
    symbol: string;
    name: string;
    icon: string;
    decimals: number;
    oracle_id: string;
    volume: string;
    amount?: string;
  }
  export type BotPair = {
    id: number;
    pair_id: string;
    name: string;
    base_token: Token;
    quote_token: Token;
    symbol: string;
    ticker: PairTicker;
    is_main: boolean;
    is_meme: boolean;
    is_mining: boolean;
    is_warn: boolean;
    chain: Chain;
    support_grid?: boolean;
    support_dca?: boolean;
    types?: BotType[];
    apy_daily: number;
    apy_daily_bot_id: number;
    apy_monthly: number;
    apy_monthly_bot_id: number;
    apy_weekly: number;
    apy_weekly_bot_id: number;
    change: string;
    liquidity: number;
    market_cap: number;
    market_cap_volume: number;
    pair_db_id: number;
    // price: string;
    pair_price: string;
    ranking: number;
    type: string;
    vaults: number;
    volatility: number;
    volume_24h: number;
    volume_total: number;
  };

  export type PairTicker = {
    pair_id: string;
    last_price: string;
    high: string;
    low: string;
    open: string;
    quote_volume: string;
    quote_usd: string;
    price_change_percent: string;
    all_quote_volume: string;
    all_quote_usd: string;
  };

  export type BotType = 'grid' | 'swing' | 'dca';
  export type GridBotType = 'grid' | 'swing';
  export type BotStatus = 'active' | 'expired' | 'closed';

  export interface MarketGridBot {
    index: number;
    bot_id: number;
    name: string;
    chain: Chain;
    type: GridBotType;
    grid_style: GridBotType;
    account_id: string;
    pair_id: string;
    investment_base: Investment;
    investment_quote: Investment;
    profit_volume: string;
    arbitrage_profit_usd: string;
    arbitrage_profit_percent?: string;
    profit_24_usd: string;
    profit_24_percent: string;
    apy: string;
    apy_24: string;
    arbitrage_apy: string;
    running_second: number;
    bot_create_time: number;
    bot_close_time: number;
    status: string;
    valid_until: number;
    min_price?: string;
    max_price?: string;
    base_volume?: string;
    quote_volume?: string;
    base_order_price?: string;
    quote_order_price?: string;
    totalInvestmentUsd?: string;
  }

  export interface Investment {
    id: number;
    code: string;
    symbol: string;
    name: string;
    icon: string;
    decimals: number;
    oracle_id: string;
    volume: string;
  }

  export type MarketBot<T extends BotType = BotType> = T extends 'dca' ? DCABot : MarketGridBot;

  export type Bot<T extends BotType = BotType> = T extends 'dca' ? DCABot : GridBot;

  export type GridType = 'EqOffset' | 'EqRate';

  export interface GridBot {
    id: number;
    account_id: string;
    name: string;
    type: GridBotType;
    chain: Chain;
    grid_style: GridBotType;
    base_token: Token;
    quote_token: Token;
    fill_type: number;
    profit_volume: string;
    profit_claimed_available_volume: string;
    apy: string;
    apy_24: string;
    arbitrage_apy: string;
    profit_24_usd: string;
    profit_24_per_grid: string;
    total_profit_usd: string;
    total_profit_percent: string;
    position_profit_usd: string;
    position_profit_percent: string;
    arbitrage_profit_usd: string;
    arbitrage_profit_percent: string;
    profit_per_grid: string;
    min_price: string;
    max_price: string;
    grid_amount: number;
    trigger_price: string;
    bot_create_time: number;
    bot_close_time: number;
    status: BotStatus;
    valid_until: number;
    entry_price: string;
    base_volume: string;
    quote_volume: string;
    base_order_price: string;
    quote_order_price: string;
    first_base_amount: string;
    first_quote_amount: string;
    base_close_price: string;
    quote_close_price: string;
    buy_count: number;
    sell_count: number;
    totalInvestmentUsd?: string;
  }

  export interface DCABot {
    id: string;
    bot_id: string;
    chain: Chain;
    dca_id: string;
    pair_id: string;
    account_id: string;
    name: string;
    type: Extract<BotType, 'dca'>;
    token_in: string;
    token_out: string;
    single_amount_in: string;
    start_time: number;
    interval_time: number;
    count: number;
    lowest_price: string;
    highest_price: string;
    need_withdraw_amount: string;
    execute_count: number;
    process: number;
    profit: string;
    profit_percent: string;
    buy_amount_record: string;
    slippage: string;
    buy_amount_to_user: boolean;
    locked: boolean;
    closed: boolean;
    dca_create_time: number;
    bot_create_time: number;
    dca_close_time: number;
    left_amount_in: string;
    left_amount_out: string;
    buy_amount_out: string;
    status: BotStatus;
    frequency: string;
    side: TradeType;
    tradeType: TradeType;
    baseToken?: TokenMetadata;
    quoteToken?: TokenMetadata;
    tokenIn?: TokenMetadata;
    tokenOut?: TokenMetadata;
    filledAmount: string;
    filledPercent: string;
    investmentAmount: string;
    endTime: number;
    create_token_amount: string;
  }

  export type BotCreateParams<T extends BotType = 'grid'> = T extends 'grid'
    ? GridBotCreateParams
    : T extends 'swing'
      ? SwingBotCreateParams
      : DCABotCreateParams;

  export interface GridBotCreateParams
    extends Pick<
      GridBot,
      'name' | 'min_price' | 'max_price' | 'grid_amount' | 'trigger_price' | 'entry_price'
    > {
    pair_id: string;
    quantityPreGrid: string;
    validityPeriod: number;
    slippage: number;
    take_profit_price?: string;
    stop_loss_price?: string;
  }

  export type TradeType = 'buy' | 'sell';

  export interface SwingBotCreateParams
    extends Pick<
      GridBot,
      'name' | 'min_price' | 'max_price' | 'grid_amount' | 'trigger_price' | 'entry_price'
    > {
    swingType: 'buy' | 'sell';
    intervalPrice: string;
    everyPhasedAmount: string;
    pair_id: string;
    validityPeriod: number;
    slippage: number;
    take_profit_price?: string;
    stop_loss_price?: string;
    isReset?: boolean;
  }

  export interface DCABotCreateParams
    extends Pick<
      DCABot,
      'name' | 'start_time' | 'single_amount_in' | 'count' | 'lowest_price' | 'highest_price'
    > {
    pair_id: string;
    tradeType: 'buy' | 'sell';
    slippage: number;
    frequencyTimes: number;
    frequencyType: 'minute' | 'hour' | 'day';
    enableAdvanced: boolean;
    total_base_investment: string;
    total_quote_investment: string;
    base_token: Token;
    quote_token: Token;
  }

  export interface GridBotOrder {
    index: number;
    id: number;
    order_id: string;
    bot_id: number;
    account_id: string;
    buy_token: Token;
    sell_token: Token;
    sell_filled_volume: string;
    buy_filled_volume: string;
    grid_level: number;
    is_buy: boolean;
    is_forward: boolean;
    is_fill_buy: boolean;
    status: BotStatus;
    price: string;
    order_create_time: number;
    amount: string;
    total: string;
  }

  export interface GridBotTrade {
    index: number;
    id: number;
    order_id: string;
    trade_id: string;
    bot_id: number;
    account_id: string;
    opposite_account_id: string;
    filled_buy_token: Token;
    filled_sell_token: Token;
    fee_maker_token: Token;
    fee_taker_token: Token;
    is_buy: boolean;
    price: string;
    trade_create_time: number;
  }

  export interface GridBotClaim {
    index: number;
    id: number;
    bot_id: number;
    account_id: string;
    token: Token;
    claim_time: number;
    tx_hash: string;
  }

  export type BotDetailRecordType = 'orders' | 'trades' | 'claims';
}
