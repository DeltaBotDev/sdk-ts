declare namespace LeaderBoardModel {
  type Type = '24hAPR' | 'weekAPR' | 'weekProfit' | 'activity';
  interface LeaderBoard {
    id: number;
    chain: Chain;
    bot_type: BotModel.GridBotType;
    bot_grid_style: BotModel.GridBotType;
    name: string;
    bot_id: number;
    ranking: number;
    account_id: string;
    apy?: number | string;
    activity?: number | string;
    show_start_time: number;
    show_end_time: number;
    pair_id?: string;
    profit_usd?: string;
    running_second?: number;
  }
}
