import { NextResponse } from 'next/server';
import DeltaTradeSDK from '@delta-trade/core';

// Initialize SDK
const initSdk = (accountId: string) =>
  DeltaTradeSDK.initEnv({
    chain: 'near',
    network: 'mainnet',
    accountId,
  });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sdk = initSdk(searchParams.get('accountId') || '');
    const assets = await sdk.getAccountAssets();

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error('Error fetching account assets:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch account assets' },
      { status: 500 },
    );
  }
}
