export type Deltabot = {
  version: '0.1.0';
  name: 'deltabot';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'ownerId';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'createBotAccount';
      accounts: [
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'gridBot';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'gridSellCount';
          type: 'u16';
        },
        {
          name: 'gridBuyCount';
          type: 'u16';
        },
      ];
    },
    {
      name: 'createBot';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'quoteMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clock';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pair';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'gridBot';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalanceBaseUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuoteUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'depositLimitBase';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'depositLimitQuote';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userBaseTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userQuoteTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'referralRecord';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'gridType';
          type: 'u8';
        },
        {
          name: 'gridRate';
          type: 'u16';
        },
        {
          name: 'gridOffset';
          type: 'u64';
        },
        {
          name: 'firstBaseAmount';
          type: 'u64';
        },
        {
          name: 'firstQuoteAmount';
          type: 'u64';
        },
        {
          name: 'lastBaseAmount';
          type: 'u64';
        },
        {
          name: 'lastQuoteAmount';
          type: 'u64';
        },
        {
          name: 'fillBaseOrQuote';
          type: 'bool';
        },
        {
          name: 'validUntilTime';
          type: 'u64';
        },
        {
          name: 'entryPrice';
          type: 'u64';
        },
        {
          name: 'recommenderOp';
          type: {
            option: 'publicKey';
          };
        },
      ];
    },
    {
      name: 'closeBot';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'quoteMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pair';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'gridBot';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalanceBaseUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuoteUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userBaseTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userQuoteTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'closeBotParam';
          type: {
            defined: 'CloseBotParam';
          };
        },
      ];
    },
    {
      name: 'createOrders';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'makerForwardOrder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'makerReverseOrder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'createOrderParam';
          type: {
            defined: 'CreateOrdersParam';
          };
        },
      ];
    },
    {
      name: 'takeOrders';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pair';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'clock';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'takerTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'takerBuyTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'makerGridBot';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'makerForwardOrder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'makerReverseOrder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalanceBaseUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuoteUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'protocolBalanceBaseRecord';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'protocolBalanceQuoteRecord';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'makerUsers';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'takerSellLimit';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'referralRecord';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'referralBaseFee';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'referralQuoteFee';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'takeOrderParam';
          type: {
            defined: 'TakeOrdersParam';
          };
        },
      ];
    },
    {
      name: 'claim';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'quoteMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'gridBot';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'pair';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceBaseUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuoteUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userBaseTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userQuoteTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'claimParam';
          type: {
            defined: 'ClaimParam';
          };
        },
      ];
    },
    {
      name: 'setOwner';
      accounts: [
        {
          name: 'newOwnerId';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'registerGlobalToken';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'globalBalanceUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'globalBalance';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'registerProtocolToken';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'protocolRecord';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'registerDepositLimit';
      accounts: [
        {
          name: 'token';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'depositLimit';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'registerPair';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'pair';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'baseMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'quoteMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'depositLimitBase';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'depositLimitQuote';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'baseMinDeposit';
          type: 'u64';
        },
        {
          name: 'quoteMinDeposit';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setMinDeposit';
      accounts: [
        {
          name: 'token';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'depositLimit';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'minDeposit';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setProtocolFeeRate';
      accounts: [
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'newProtocolFeeRate';
          type: 'u32';
        },
        {
          name: 'newTakerFeeRate';
          type: 'u32';
        },
      ];
    },
    {
      name: 'setReferralFeeRate';
      accounts: [
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'newReferralFeeRate';
          type: 'u32';
        },
      ];
    },
    {
      name: 'withdrawProtocolFee';
      accounts: [
        {
          name: 'gridBotState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'toUser';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'protocolBalanceUser';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'protocolBalance';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'start';
      accounts: [
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'pause';
      accounts: [
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'shutdown';
      accounts: [
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'setMakerUser';
      accounts: [
        {
          name: 'gridBotState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'makerUsers';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'makerUser';
          type: 'publicKey';
        },
        {
          name: 'enable';
          type: 'bool';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'makerUsers';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'users';
            type: {
              vec: 'publicKey';
            };
          },
        ];
      };
    },
    {
      name: 'gridBotState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isInitialized';
            type: 'bool';
          },
          {
            name: 'ownerId';
            type: 'publicKey';
          },
          {
            name: 'oracleValidTime';
            type: 'u64';
          },
          {
            name: 'status';
            type: {
              defined: 'GridStatus';
            };
          },
          {
            name: 'protocolFeeRate';
            docs: ['real_protocol_fee = protocol_fee / 1000000'];
            type: 'u32';
          },
          {
            name: 'takerFeeRate';
            type: 'u32';
          },
          {
            name: 'referFeeRate';
            type: 'u32';
          },
          {
            name: 'nextBotId';
            docs: ['start from 0, used from 1'];
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'userState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'nextUserBotId';
            type: 'u32';
          },
        ];
      };
    },
    {
      name: 'dataRecord';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'data';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'referralRecord';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'user';
            type: 'publicKey';
          },
        ];
      };
    },
    {
      name: 'gridBot';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isInitialized';
            type: 'bool';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'active';
            type: 'bool';
          },
          {
            name: 'user';
            type: 'publicKey';
          },
          {
            name: 'botId';
            type: 'u64';
          },
          {
            name: 'closed';
            type: 'bool';
          },
          {
            name: 'pairId';
            type: 'string';
          },
          {
            name: 'gridType';
            type: 'u8';
          },
          {
            name: 'gridSellCount';
            type: 'u16';
          },
          {
            name: 'gridBuyCount';
            type: 'u16';
          },
          {
            name: 'gridRate';
            docs: ['real_grid_rate = grid_rate / 10000'];
            type: 'u16';
          },
          {
            name: 'gridOffset';
            type: 'u64';
          },
          {
            name: 'firstBaseAmount';
            type: 'u64';
          },
          {
            name: 'firstQuoteAmount';
            type: 'u64';
          },
          {
            name: 'lastBaseAmount';
            type: 'u64';
          },
          {
            name: 'lastQuoteAmount';
            type: 'u64';
          },
          {
            name: 'fillBaseOrQuote';
            type: 'bool';
          },
          {
            name: 'validUntilTime';
            type: 'u64';
          },
          {
            name: 'totalQuoteAmount';
            type: 'u64';
          },
          {
            name: 'totalBaseAmount';
            type: 'u64';
          },
          {
            name: 'revenue';
            type: 'u64';
          },
          {
            name: 'totalRevenue';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'order';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tokenSellIsBase';
            type: 'bool';
          },
          {
            name: 'fillBuyOrSell';
            type: 'bool';
          },
          {
            name: 'amountSell';
            type: 'u64';
          },
          {
            name: 'amountBuy';
            type: 'u64';
          },
          {
            name: 'filled';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'pair';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseToken';
            type: 'publicKey';
          },
          {
            name: 'quoteToken';
            type: 'publicKey';
          },
        ];
      };
    },
    {
      name: 'accountBalance';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'balance';
            type: 'u128';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'GridBotOutput';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isInitialized';
            type: 'bool';
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'active';
            type: 'bool';
          },
          {
            name: 'user';
            type: 'publicKey';
          },
          {
            name: 'botId';
            type: 'u64';
          },
          {
            name: 'closed';
            type: 'bool';
          },
          {
            name: 'pairId';
            type: 'string';
          },
          {
            name: 'gridType';
            type: 'u8';
          },
          {
            name: 'gridSellCount';
            type: 'u16';
          },
          {
            name: 'gridBuyCount';
            type: 'u16';
          },
          {
            name: 'gridRate';
            docs: ['real_grid_rate = grid_rate / 10000'];
            type: 'u16';
          },
          {
            name: 'gridOffset';
            type: 'u64';
          },
          {
            name: 'firstBaseAmount';
            type: 'u64';
          },
          {
            name: 'firstQuoteAmount';
            type: 'u64';
          },
          {
            name: 'lastBaseAmount';
            type: 'u64';
          },
          {
            name: 'lastQuoteAmount';
            type: 'u64';
          },
          {
            name: 'fillBaseOrQuote';
            type: 'bool';
          },
          {
            name: 'validUntilTime';
            type: 'u64';
          },
          {
            name: 'totalQuoteAmount';
            type: 'u64';
          },
          {
            name: 'totalBaseAmount';
            type: 'u64';
          },
          {
            name: 'revenue';
            type: 'u64';
          },
          {
            name: 'totalRevenue';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'PairOutput';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseToken';
            type: 'publicKey';
          },
          {
            name: 'quoteToken';
            type: 'publicKey';
          },
        ];
      };
    },
    {
      name: 'CloseBotParam';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'userStateId';
            type: 'u32';
          },
          {
            name: 'globalBaseBump';
            type: 'u8';
          },
          {
            name: 'globalQuoteBump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'ClaimParam';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'userStateId';
            type: 'u32';
          },
          {
            name: 'globalBaseBump';
            type: 'u8';
          },
          {
            name: 'globalQuoteBump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'TakeOrdersParam';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseMint';
            type: 'publicKey';
          },
          {
            name: 'quoteMint';
            type: 'publicKey';
          },
          {
            name: 'makerKey';
            type: 'publicKey';
          },
          {
            name: 'makerUserStateId';
            type: 'u32';
          },
          {
            name: 'makerLevel';
            type: 'u16';
          },
          {
            name: 'makerForwardOrReverse';
            type: 'bool';
          },
          {
            name: 'tokenSell';
            type: 'publicKey';
          },
          {
            name: 'tokenBuy';
            type: 'publicKey';
          },
          {
            name: 'amountSell';
            type: 'u64';
          },
          {
            name: 'amountBuy';
            type: 'u64';
          },
          {
            name: 'fillBuyOrSell';
            type: 'bool';
          },
          {
            name: 'globalBaseBump';
            type: 'u8';
          },
          {
            name: 'globalQuoteBump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'CreateOrdersParam';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'makerKey';
            type: 'publicKey';
          },
          {
            name: 'makerUserStateId';
            type: 'u32';
          },
          {
            name: 'makerLevel';
            type: 'u16';
          },
        ];
      };
    },
    {
      name: 'GridStatus';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Running';
          },
          {
            name: 'Paused';
          },
          {
            name: 'Shutdown';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'RegisterPairEvent';
      fields: [
        {
          name: 'baseToken';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'quoteToken';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'CreateEvent';
      fields: [
        {
          name: 'accountId';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'botId';
          type: 'string';
          index: false;
        },
        {
          name: 'userStateId';
          type: 'string';
          index: false;
        },
        {
          name: 'basePrice';
          type: 'string';
          index: false;
        },
        {
          name: 'quotePrice';
          type: 'string';
          index: false;
        },
        {
          name: 'baseExpo';
          type: 'string';
          index: false;
        },
        {
          name: 'quoteExpo';
          type: 'string';
          index: false;
        },
        {
          name: 'entryPrice';
          type: 'u64';
          index: false;
        },
        {
          name: 'pair';
          type: {
            defined: 'PairOutput';
          };
          index: false;
        },
        {
          name: 'gridBot';
          type: {
            defined: 'GridBotOutput';
          };
          index: false;
        },
      ];
    },
    {
      name: 'CloseEvent';
      fields: [
        {
          name: 'accountId';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'botId';
          type: 'string';
          index: false;
        },
        {
          name: 'userStateId';
          type: 'string';
          index: false;
        },
        {
          name: 'refund';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'OrderUpdateEvent';
      fields: [
        {
          name: 'botId';
          type: 'string';
          index: false;
        },
        {
          name: 'userStateId';
          type: 'string';
          index: false;
        },
        {
          name: 'forwardOrReverse';
          type: 'bool';
          index: false;
        },
        {
          name: 'level';
          type: 'u16';
          index: false;
        },
        {
          name: 'tokenSell';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'tokenBuy';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amountSell';
          type: 'u64';
          index: false;
        },
        {
          name: 'amountBuy';
          type: 'u64';
          index: false;
        },
        {
          name: 'fillBuyOrSell';
          type: 'bool';
          index: false;
        },
        {
          name: 'filled';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'TakeOrderEvent';
      fields: [
        {
          name: 'taker';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'maker';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'makerBotId';
          type: 'string';
          index: false;
        },
        {
          name: 'makerUserStateId';
          type: 'string';
          index: false;
        },
        {
          name: 'makerForwardOrReverse';
          type: 'bool';
          index: false;
        },
        {
          name: 'makerLevel';
          type: 'u16';
          index: false;
        },
        {
          name: 'tookSell';
          type: 'u64';
          index: false;
        },
        {
          name: 'tookBuy';
          type: 'u64';
          index: false;
        },
        {
          name: 'takerFee';
          type: 'u64';
          index: false;
        },
        {
          name: 'protocolFee';
          type: 'u64';
          index: false;
        },
        {
          name: 'referralFee';
          type: 'u64';
          index: false;
        },
        {
          name: 'currentRevenue';
          type: 'u64';
          index: false;
        },
        {
          name: 'makerLeftRevenue';
          type: 'u64';
          index: false;
        },
        {
          name: 'makerTotalRevenue';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'WithdrawEvent';
      fields: [
        {
          name: 'from';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'to';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenId';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'ReferralEvent';
      fields: [
        {
          name: 'user';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'recommender';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenId';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'TransferEvent';
      fields: [
        {
          name: 'from';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'to';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenId';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'ClaimEvent';
      fields: [
        {
          name: 'claimUser';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'botId';
          type: 'string';
          index: false;
        },
        {
          name: 'userStateId';
          type: 'string';
          index: false;
        },
        {
          name: 'user';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'revenueToken';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'revenue';
          type: 'u64';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'InvalidProgramId';
      msg: 'InvalidProgramId';
    },
    {
      code: 6001;
      name: 'UnexpectedAccount';
      msg: 'UnexpectedAccount';
    },
    {
      code: 6002;
      name: 'Initialized';
      msg: 'Initialized';
    },
    {
      code: 6003;
      name: 'NotAllowed';
      msg: 'NotAllowed';
    },
    {
      code: 6004;
      name: 'InvalidToken';
      msg: 'InvalidToken';
    },
    {
      code: 6005;
      name: 'InvalidOracleId';
      msg: 'InvalidOracleId';
    },
    {
      code: 6006;
      name: 'HadShutdown';
      msg: 'HadShutdown';
    },
    {
      code: 6007;
      name: 'InvalidFeeRate';
      msg: 'InvalidFeeRate';
    },
    {
      code: 6008;
      name: 'InvalidAmount';
      msg: 'InvalidAmount';
    },
    {
      code: 6009;
      name: 'InvalidUntilTime';
      msg: 'InvalidUntilTime';
    },
    {
      code: 6010;
      name: 'InvalidPair';
      msg: 'InvalidPair';
    },
    {
      code: 6011;
      name: 'PauseOrShutdown';
      msg: 'PauseOrShutdown';
    },
    {
      code: 6012;
      name: 'MoreThanMaxGridCount';
      msg: 'MoreThanMaxGridCount';
    },
    {
      code: 6013;
      name: 'LessThanMinGridCount';
      msg: 'LessThanMinGridCount';
    },
    {
      code: 6014;
      name: 'InvalidFirstOrLastAmount';
      msg: 'InvalidFirstOrLastAmount';
    },
    {
      code: 6015;
      name: 'BaseTooSmall';
      msg: 'BaseTooSmall';
    },
    {
      code: 6016;
      name: 'QuoteTooSmall';
      msg: 'QuoteTooSmall';
    },
    {
      code: 6017;
      name: 'LessBaseToken';
      msg: 'LessBaseToken';
    },
    {
      code: 6018;
      name: 'LessQuoteToken';
      msg: 'LessQuoteToken';
    },
    {
      code: 6019;
      name: 'InvalidBotStatus';
      msg: 'InvalidBotStatus';
    },
    {
      code: 6020;
      name: 'InvalidUser';
      msg: 'InvalidUser';
    },
    {
      code: 6021;
      name: 'InvalidOrderAmount';
      msg: 'InvalidOrderAmount';
    },
    {
      code: 6022;
      name: 'LessTokenSell';
      msg: 'LessTokenSell';
    },
    {
      code: 6023;
      name: 'InvalidOrderToken';
      msg: 'InvalidOrderToken';
    },
    {
      code: 6024;
      name: 'BotClosed';
      msg: 'BotClosed';
    },
    {
      code: 6025;
      name: 'BotDisable';
      msg: 'BotDisable';
    },
    {
      code: 6026;
      name: 'BotExpired';
      msg: 'BotExpired';
    },
    {
      code: 6027;
      name: 'InvalidMakerForwardOrReverse';
      msg: 'InvalidMakerForwardOrReverse';
    },
    {
      code: 6028;
      name: 'InvalidOrderMatching';
      msg: 'InvalidOrderMatching';
    },
    {
      code: 6029;
      name: 'InvalidName';
      msg: 'InvalidName';
    },
    {
      code: 6030;
      name: 'OrderPriceNotMatch';
      msg: 'OrderPriceNotMatch';
    },
  ];
};

export const IDL: Deltabot = {
  version: '0.1.0',
  name: 'deltabot',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'ownerId',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createBotAccount',
      accounts: [
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'gridBot',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'gridSellCount',
          type: 'u16',
        },
        {
          name: 'gridBuyCount',
          type: 'u16',
        },
      ],
    },
    {
      name: 'createBot',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quoteMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pair',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gridBot',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalanceBaseUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuoteUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositLimitBase',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'depositLimitQuote',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userBaseTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userQuoteTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'referralRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'gridType',
          type: 'u8',
        },
        {
          name: 'gridRate',
          type: 'u16',
        },
        {
          name: 'gridOffset',
          type: 'u64',
        },
        {
          name: 'firstBaseAmount',
          type: 'u64',
        },
        {
          name: 'firstQuoteAmount',
          type: 'u64',
        },
        {
          name: 'lastBaseAmount',
          type: 'u64',
        },
        {
          name: 'lastQuoteAmount',
          type: 'u64',
        },
        {
          name: 'fillBaseOrQuote',
          type: 'bool',
        },
        {
          name: 'validUntilTime',
          type: 'u64',
        },
        {
          name: 'entryPrice',
          type: 'u64',
        },
        {
          name: 'recommenderOp',
          type: {
            option: 'publicKey',
          },
        },
      ],
    },
    {
      name: 'closeBot',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quoteMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pair',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gridBot',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalanceBaseUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuoteUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userBaseTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userQuoteTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'closeBotParam',
          type: {
            defined: 'CloseBotParam',
          },
        },
      ],
    },
    {
      name: 'createOrders',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'makerForwardOrder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'makerReverseOrder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'createOrderParam',
          type: {
            defined: 'CreateOrdersParam',
          },
        },
      ],
    },
    {
      name: 'takeOrders',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pair',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'takerTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'takerBuyTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'makerGridBot',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'makerForwardOrder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'makerReverseOrder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalanceBaseUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuoteUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'protocolBalanceBaseRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'protocolBalanceQuoteRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'makerUsers',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'takerSellLimit',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'referralRecord',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'referralBaseFee',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'referralQuoteFee',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'takeOrderParam',
          type: {
            defined: 'TakeOrdersParam',
          },
        },
      ],
    },
    {
      name: 'claim',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quoteMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gridBot',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'pair',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceBaseUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuoteUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userBaseTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userQuoteTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'claimParam',
          type: {
            defined: 'ClaimParam',
          },
        },
      ],
    },
    {
      name: 'setOwner',
      accounts: [
        {
          name: 'newOwnerId',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'registerGlobalToken',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'globalBalanceUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'globalBalance',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'registerProtocolToken',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'protocolRecord',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'registerDepositLimit',
      accounts: [
        {
          name: 'token',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'depositLimit',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'registerPair',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'pair',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'baseMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'quoteMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'depositLimitBase',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'depositLimitQuote',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'baseMinDeposit',
          type: 'u64',
        },
        {
          name: 'quoteMinDeposit',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setMinDeposit',
      accounts: [
        {
          name: 'token',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'depositLimit',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'minDeposit',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setProtocolFeeRate',
      accounts: [
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newProtocolFeeRate',
          type: 'u32',
        },
        {
          name: 'newTakerFeeRate',
          type: 'u32',
        },
      ],
    },
    {
      name: 'setReferralFeeRate',
      accounts: [
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newReferralFeeRate',
          type: 'u32',
        },
      ],
    },
    {
      name: 'withdrawProtocolFee',
      accounts: [
        {
          name: 'gridBotState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'toUser',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'protocolBalanceUser',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'protocolBalance',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'start',
      accounts: [
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'pause',
      accounts: [
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'shutdown',
      accounts: [
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'setMakerUser',
      accounts: [
        {
          name: 'gridBotState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'makerUsers',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'makerUser',
          type: 'publicKey',
        },
        {
          name: 'enable',
          type: 'bool',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'makerUsers',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'users',
            type: {
              vec: 'publicKey',
            },
          },
        ],
      },
    },
    {
      name: 'gridBotState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isInitialized',
            type: 'bool',
          },
          {
            name: 'ownerId',
            type: 'publicKey',
          },
          {
            name: 'oracleValidTime',
            type: 'u64',
          },
          {
            name: 'status',
            type: {
              defined: 'GridStatus',
            },
          },
          {
            name: 'protocolFeeRate',
            docs: ['real_protocol_fee = protocol_fee / 1000000'],
            type: 'u32',
          },
          {
            name: 'takerFeeRate',
            type: 'u32',
          },
          {
            name: 'referFeeRate',
            type: 'u32',
          },
          {
            name: 'nextBotId',
            docs: ['start from 0, used from 1'],
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'userState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'nextUserBotId',
            type: 'u32',
          },
        ],
      },
    },
    {
      name: 'dataRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'data',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'referralRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'user',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'gridBot',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isInitialized',
            type: 'bool',
          },
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'active',
            type: 'bool',
          },
          {
            name: 'user',
            type: 'publicKey',
          },
          {
            name: 'botId',
            type: 'u64',
          },
          {
            name: 'closed',
            type: 'bool',
          },
          {
            name: 'pairId',
            type: 'string',
          },
          {
            name: 'gridType',
            type: 'u8',
          },
          {
            name: 'gridSellCount',
            type: 'u16',
          },
          {
            name: 'gridBuyCount',
            type: 'u16',
          },
          {
            name: 'gridRate',
            docs: ['real_grid_rate = grid_rate / 10000'],
            type: 'u16',
          },
          {
            name: 'gridOffset',
            type: 'u64',
          },
          {
            name: 'firstBaseAmount',
            type: 'u64',
          },
          {
            name: 'firstQuoteAmount',
            type: 'u64',
          },
          {
            name: 'lastBaseAmount',
            type: 'u64',
          },
          {
            name: 'lastQuoteAmount',
            type: 'u64',
          },
          {
            name: 'fillBaseOrQuote',
            type: 'bool',
          },
          {
            name: 'validUntilTime',
            type: 'u64',
          },
          {
            name: 'totalQuoteAmount',
            type: 'u64',
          },
          {
            name: 'totalBaseAmount',
            type: 'u64',
          },
          {
            name: 'revenue',
            type: 'u64',
          },
          {
            name: 'totalRevenue',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'order',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tokenSellIsBase',
            type: 'bool',
          },
          {
            name: 'fillBuyOrSell',
            type: 'bool',
          },
          {
            name: 'amountSell',
            type: 'u64',
          },
          {
            name: 'amountBuy',
            type: 'u64',
          },
          {
            name: 'filled',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'pair',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'baseToken',
            type: 'publicKey',
          },
          {
            name: 'quoteToken',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'accountBalance',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'balance',
            type: 'u128',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'GridBotOutput',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'isInitialized',
            type: 'bool',
          },
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'active',
            type: 'bool',
          },
          {
            name: 'user',
            type: 'publicKey',
          },
          {
            name: 'botId',
            type: 'u64',
          },
          {
            name: 'closed',
            type: 'bool',
          },
          {
            name: 'pairId',
            type: 'string',
          },
          {
            name: 'gridType',
            type: 'u8',
          },
          {
            name: 'gridSellCount',
            type: 'u16',
          },
          {
            name: 'gridBuyCount',
            type: 'u16',
          },
          {
            name: 'gridRate',
            docs: ['real_grid_rate = grid_rate / 10000'],
            type: 'u16',
          },
          {
            name: 'gridOffset',
            type: 'u64',
          },
          {
            name: 'firstBaseAmount',
            type: 'u64',
          },
          {
            name: 'firstQuoteAmount',
            type: 'u64',
          },
          {
            name: 'lastBaseAmount',
            type: 'u64',
          },
          {
            name: 'lastQuoteAmount',
            type: 'u64',
          },
          {
            name: 'fillBaseOrQuote',
            type: 'bool',
          },
          {
            name: 'validUntilTime',
            type: 'u64',
          },
          {
            name: 'totalQuoteAmount',
            type: 'u64',
          },
          {
            name: 'totalBaseAmount',
            type: 'u64',
          },
          {
            name: 'revenue',
            type: 'u64',
          },
          {
            name: 'totalRevenue',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'PairOutput',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'baseToken',
            type: 'publicKey',
          },
          {
            name: 'quoteToken',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'CloseBotParam',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'userStateId',
            type: 'u32',
          },
          {
            name: 'globalBaseBump',
            type: 'u8',
          },
          {
            name: 'globalQuoteBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'ClaimParam',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'userStateId',
            type: 'u32',
          },
          {
            name: 'globalBaseBump',
            type: 'u8',
          },
          {
            name: 'globalQuoteBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'TakeOrdersParam',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'baseMint',
            type: 'publicKey',
          },
          {
            name: 'quoteMint',
            type: 'publicKey',
          },
          {
            name: 'makerKey',
            type: 'publicKey',
          },
          {
            name: 'makerUserStateId',
            type: 'u32',
          },
          {
            name: 'makerLevel',
            type: 'u16',
          },
          {
            name: 'makerForwardOrReverse',
            type: 'bool',
          },
          {
            name: 'tokenSell',
            type: 'publicKey',
          },
          {
            name: 'tokenBuy',
            type: 'publicKey',
          },
          {
            name: 'amountSell',
            type: 'u64',
          },
          {
            name: 'amountBuy',
            type: 'u64',
          },
          {
            name: 'fillBuyOrSell',
            type: 'bool',
          },
          {
            name: 'globalBaseBump',
            type: 'u8',
          },
          {
            name: 'globalQuoteBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'CreateOrdersParam',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'makerKey',
            type: 'publicKey',
          },
          {
            name: 'makerUserStateId',
            type: 'u32',
          },
          {
            name: 'makerLevel',
            type: 'u16',
          },
        ],
      },
    },
    {
      name: 'GridStatus',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Running',
          },
          {
            name: 'Paused',
          },
          {
            name: 'Shutdown',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'RegisterPairEvent',
      fields: [
        {
          name: 'baseToken',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'quoteToken',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'CreateEvent',
      fields: [
        {
          name: 'accountId',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'botId',
          type: 'string',
          index: false,
        },
        {
          name: 'userStateId',
          type: 'string',
          index: false,
        },
        {
          name: 'basePrice',
          type: 'string',
          index: false,
        },
        {
          name: 'quotePrice',
          type: 'string',
          index: false,
        },
        {
          name: 'baseExpo',
          type: 'string',
          index: false,
        },
        {
          name: 'quoteExpo',
          type: 'string',
          index: false,
        },
        {
          name: 'entryPrice',
          type: 'u64',
          index: false,
        },
        {
          name: 'pair',
          type: {
            defined: 'PairOutput',
          },
          index: false,
        },
        {
          name: 'gridBot',
          type: {
            defined: 'GridBotOutput',
          },
          index: false,
        },
      ],
    },
    {
      name: 'CloseEvent',
      fields: [
        {
          name: 'accountId',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'botId',
          type: 'string',
          index: false,
        },
        {
          name: 'userStateId',
          type: 'string',
          index: false,
        },
        {
          name: 'refund',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'OrderUpdateEvent',
      fields: [
        {
          name: 'botId',
          type: 'string',
          index: false,
        },
        {
          name: 'userStateId',
          type: 'string',
          index: false,
        },
        {
          name: 'forwardOrReverse',
          type: 'bool',
          index: false,
        },
        {
          name: 'level',
          type: 'u16',
          index: false,
        },
        {
          name: 'tokenSell',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'tokenBuy',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amountSell',
          type: 'u64',
          index: false,
        },
        {
          name: 'amountBuy',
          type: 'u64',
          index: false,
        },
        {
          name: 'fillBuyOrSell',
          type: 'bool',
          index: false,
        },
        {
          name: 'filled',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'TakeOrderEvent',
      fields: [
        {
          name: 'taker',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'maker',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'makerBotId',
          type: 'string',
          index: false,
        },
        {
          name: 'makerUserStateId',
          type: 'string',
          index: false,
        },
        {
          name: 'makerForwardOrReverse',
          type: 'bool',
          index: false,
        },
        {
          name: 'makerLevel',
          type: 'u16',
          index: false,
        },
        {
          name: 'tookSell',
          type: 'u64',
          index: false,
        },
        {
          name: 'tookBuy',
          type: 'u64',
          index: false,
        },
        {
          name: 'takerFee',
          type: 'u64',
          index: false,
        },
        {
          name: 'protocolFee',
          type: 'u64',
          index: false,
        },
        {
          name: 'referralFee',
          type: 'u64',
          index: false,
        },
        {
          name: 'currentRevenue',
          type: 'u64',
          index: false,
        },
        {
          name: 'makerLeftRevenue',
          type: 'u64',
          index: false,
        },
        {
          name: 'makerTotalRevenue',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'WithdrawEvent',
      fields: [
        {
          name: 'from',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'to',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenId',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'ReferralEvent',
      fields: [
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'recommender',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenId',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'TransferEvent',
      fields: [
        {
          name: 'from',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'to',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenId',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'ClaimEvent',
      fields: [
        {
          name: 'claimUser',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'botId',
          type: 'string',
          index: false,
        },
        {
          name: 'userStateId',
          type: 'string',
          index: false,
        },
        {
          name: 'user',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'revenueToken',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'revenue',
          type: 'u64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidProgramId',
      msg: 'InvalidProgramId',
    },
    {
      code: 6001,
      name: 'UnexpectedAccount',
      msg: 'UnexpectedAccount',
    },
    {
      code: 6002,
      name: 'Initialized',
      msg: 'Initialized',
    },
    {
      code: 6003,
      name: 'NotAllowed',
      msg: 'NotAllowed',
    },
    {
      code: 6004,
      name: 'InvalidToken',
      msg: 'InvalidToken',
    },
    {
      code: 6005,
      name: 'InvalidOracleId',
      msg: 'InvalidOracleId',
    },
    {
      code: 6006,
      name: 'HadShutdown',
      msg: 'HadShutdown',
    },
    {
      code: 6007,
      name: 'InvalidFeeRate',
      msg: 'InvalidFeeRate',
    },
    {
      code: 6008,
      name: 'InvalidAmount',
      msg: 'InvalidAmount',
    },
    {
      code: 6009,
      name: 'InvalidUntilTime',
      msg: 'InvalidUntilTime',
    },
    {
      code: 6010,
      name: 'InvalidPair',
      msg: 'InvalidPair',
    },
    {
      code: 6011,
      name: 'PauseOrShutdown',
      msg: 'PauseOrShutdown',
    },
    {
      code: 6012,
      name: 'MoreThanMaxGridCount',
      msg: 'MoreThanMaxGridCount',
    },
    {
      code: 6013,
      name: 'LessThanMinGridCount',
      msg: 'LessThanMinGridCount',
    },
    {
      code: 6014,
      name: 'InvalidFirstOrLastAmount',
      msg: 'InvalidFirstOrLastAmount',
    },
    {
      code: 6015,
      name: 'BaseTooSmall',
      msg: 'BaseTooSmall',
    },
    {
      code: 6016,
      name: 'QuoteTooSmall',
      msg: 'QuoteTooSmall',
    },
    {
      code: 6017,
      name: 'LessBaseToken',
      msg: 'LessBaseToken',
    },
    {
      code: 6018,
      name: 'LessQuoteToken',
      msg: 'LessQuoteToken',
    },
    {
      code: 6019,
      name: 'InvalidBotStatus',
      msg: 'InvalidBotStatus',
    },
    {
      code: 6020,
      name: 'InvalidUser',
      msg: 'InvalidUser',
    },
    {
      code: 6021,
      name: 'InvalidOrderAmount',
      msg: 'InvalidOrderAmount',
    },
    {
      code: 6022,
      name: 'LessTokenSell',
      msg: 'LessTokenSell',
    },
    {
      code: 6023,
      name: 'InvalidOrderToken',
      msg: 'InvalidOrderToken',
    },
    {
      code: 6024,
      name: 'BotClosed',
      msg: 'BotClosed',
    },
    {
      code: 6025,
      name: 'BotDisable',
      msg: 'BotDisable',
    },
    {
      code: 6026,
      name: 'BotExpired',
      msg: 'BotExpired',
    },
    {
      code: 6027,
      name: 'InvalidMakerForwardOrReverse',
      msg: 'InvalidMakerForwardOrReverse',
    },
    {
      code: 6028,
      name: 'InvalidOrderMatching',
      msg: 'InvalidOrderMatching',
    },
    {
      code: 6029,
      name: 'InvalidName',
      msg: 'InvalidName',
    },
    {
      code: 6030,
      name: 'OrderPriceNotMatch',
      msg: 'OrderPriceNotMatch',
    },
  ],
};
