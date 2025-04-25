import { NextResponse } from 'next/server';
import DeltaTradeSDK from '@delta-trade/core';

const initSdk = (accountId: string) =>
  DeltaTradeSDK.initEnv({
    chain: 'solana',
    network: 'mainnet',
    accountId,
    solanaConfig: {
      endpoint: process.env.NEXT_PUBLIC_SOL_RPC,
    },
  });

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;
    const accountId = searchParams.get('accountId') || '';
    const sdk = initSdk(accountId);

    const swingMode = (searchParams.get('mode') || 'classic').toLowerCase() as 'classic' | 'phased';
    const pairId = searchParams.get('pairId');
    const tradeType = searchParams.get('tradeType') as 'buy' | 'sell';
    const gridAmount = Number(searchParams.get('gridAmount') || 5);
    const intervalPrice = searchParams.get('intervalPrice');
    const amountIn = searchParams.get('amountIn');
    const everyPhasedAmount = searchParams.get('everyPhasedAmount');
    const highestBuyPrice = searchParams.get('highestBuyPrice');
    const highestPrice = searchParams.get('highestPrice');
    const name = searchParams.get('name') || `${swingMode}-swing-${accountId}`;
    const lowestPrice = searchParams.get('lowestPrice');
    const buyPrice = searchParams.get('buyPrice');
    const sellPrice = searchParams.get('sellPrice');

    let createParams: any;

    if (swingMode === 'phased') {
      createParams = {
        pairId,
        tradeType,
        gridAmount,
        intervalPrice,
        everyPhasedAmount: amountIn || everyPhasedAmount,
        highestBuyPrice: highestPrice || highestBuyPrice,
        name,
      };
    } else {
      createParams = {
        pairId,
        tradeType,
        buyPrice: lowestPrice || buyPrice,
        sellPrice: highestPrice || sellPrice,
        everyPhasedAmount: amountIn || everyPhasedAmount,
        name,
      };
    }

    console.log(`handleCreateSwing/${swingMode}/createParams`, createParams);

    const errors = await sdk.validateSwingVaultParams(swingMode, createParams);
    if (errors) {
      console.log(`handleCreateSwing/${swingMode}/validateSwingVaultParams errors`, errors);
      return NextResponse.json({ error: JSON.stringify(errors) }, { status: 400 });
    }

    let transactions;
    if (swingMode === 'phased') {
      transactions = await sdk.createPhasedSwingVault(swingMode, createParams);
    } else {
      transactions = await sdk.createClassicSwingVault(swingMode, createParams);
    }

    console.log(`handleCreateSwing/${swingMode}/transactions`, transactions);
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Failed to create Swing vault:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
