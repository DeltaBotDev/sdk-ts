declare namespace ActivityModel {
  interface ActivitySummary {
    reward_paid: number;
    reward_ongoing: number;
    users: number;
    ranking_reward: number;
  }
  interface Activity {
    id: number;
    type: string;
    ranking: number;
    image_url: string;
    title: string;
    text: string;
    show_start_time: number;
    show_end_time: number;
  }
  interface Airdrop {
    Config: {
      in_range_multiplier: string;
      out_of_range_multiplier: string;
      inviter_in_range_multiplier: {
        bottom_price: string;
        top_price: string;
        inviter_in_range_multiplier: string;
      }[];
      pair: Record<
        string,
        {
          pair_id: string;
          top_price: string;
          bottom_price: string;
        }
      >;
      nft: Record<
        string,
        {
          level: number;
          multiplier: string;
        }
      >;
      profit: {
        top_price: string;
        bottom_price: string;
        multiplier: string;
      }[];
      share_config: AirdropShareTask[];
      stage_task: AirdropStageTask[];
    };
    User?: {
      account_id: string;
      dca_range_usd: string;
      in_range_usd: string;
      in_range_multiplier: string;
      out_range_usd: string;
      out_range_multiplier: string;
      inviter_in_range_usd: string;
      inviter_in_range_multiplier: string;
      nft_level: number;
      nft_multiplier: string;
      profit: string;
      profit_multiplier: string;
      hour_points: string;
      my_points_total: string;
      my_points_frozen: string;

      stage_task_rule_claim?: { account_id: string; task_id: number; level: number }[];
      share_claim?: (AirdropShareTask & { claim_time: number })[];
    };
  }
  interface AirdropShareTask {
    type: string;
    award_time: 'DAY' | 'WEEK' | 'ONCE';
    award_volume: string;
    ranking: number;
  }
  interface AirdropStageTask {
    id: number;
    rule: { volume: string; award_volume: string; level: number; task_id: number }[];
    show_end_time: number;
    show_start_time: number;
    type: string;
  }

  interface WeeklyRankingConfig {
    id: number;
    type: string;
    pair_id: string;
    ranking: number;
    title: string;
    is_participation: boolean;

    show_start_time: number;
    show_end_time: number;
    period_config: {
      period: number;
      show_start_time: number;
      show_end_time: number;
      is_complete: boolean;
      user_participation: boolean;
    };
    period_award_config: {
      start_period: number;
      end_period: number;
      token: string;
      nft: string;
      volume: string;
      start_rank: number;
      end_rank: number;
    }[];
  }
  interface RankingData {
    ranking_id: number;
    pair_id?: string;
    period: number;
    ranking: number;
    bot: number;
    address: string;
    apy: string;
    profit_usd?: string;
    user_name: string;
    activity: string;
    total_claim: string;
    show_end_time: number;
    show_start_time: number;
    time: number;
  }
  interface RankingClaimLog {
    id: number;
    account_id: string;
    ranking_id: number;
    period: number;
    token: string;
    nft: string;
    volume: string;
    ranking: number;
    type: 'PENDING' | 'CLAIMING' | 'CLAIMED';
    tx_hash: string;
    create_time: number;
    update_time: number;
  }
  interface ProfitCouponConfig {
    config: {
      id: number;
      token: string;
      profit_time: number;
      show_start_time: number;
      show_end_time: number;
      is_delete: boolean;
      profit_coupon_details_config: {
        id: number;
        profit_id: number;
        type: string;
        pair_id: string;
        token: string;
        volume: string;
      }[];
    };
    user?: {
      Asset: {
        id: number;
        profit_id: number;
        account_id: string;
        token: string;
        fee_volume: string;
        total_volume: string;
        available_volume: string;
        claimed_volume: string;
        freeze_volume: string;
        start_time: number;
        end_time: number;
      };
      MyProfit: {
        profit_id: number;
        coupon_id: number;
        account_id: string;
        token: string;
        volume: string;
        type: string;
        start_time: number;
        end_time: number;
      }[];
    };
  }

  interface MiningConfig {
    config: {
      mining_id: number;
      pair_id: string;
      baseToken?: Token.TokenMeta;
      quoteToken?: Token.TokenMeta;
      ranking: number;
      top_price: string;
      show_apy: string;
      bottom_price: string;
      in_range_multiplier: string;
      start_time: number;
      end_time: number;
      is_delete: boolean;
      mining_reward_config: {
        mining_id: number;
        token: string;
        total_volume: string;
        start_time: number;
        end_time: number;
        CreateTime: string;
        UpdateTime: string;
      }[];
      mining_boost_profit_config: any[];
      mining_boost_nft_config: any[];
      mining_boost_burrow_config: any[];
      mining_boost_bridge_config: any[];
    }[];
    user?: {
      account_id: string;
      per_hour_apy: string;
      per_hour_amount: string;
      total_rewards: string;
      unclaimed_rewards: string;
      asset?: {
        account_id: string;
        mining_id: number;
        pair_id: string;
        asset: string;
        boost_bridge_amount: string;
        boost_bridge_proportion: string;
        boost_burrow_amount: string;
        boost_burrow_proportion: string;
        grid_vault: string;
        swing_vault: string;
        dca_vault: string;
        reward: string;
        apy: string;
      }[];
      balances?: {
        account_id: string;
        token: string;
        total: string;
        frozen: string;
        receive: string;
      }[];
    };
  }
}
