import { NextResponse } from 'next/server';
import DeltaTradeSDK, { VaultType } from '@delta-trade/core';

// Initialize SDK
const initSdk = () =>
  DeltaTradeSDK.initEnv({
    chain: 'near',
    network: 'mainnet',
  });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'dca') as VaultType;
    console.log('type', type);
    const sdk = initSdk();
    console.log('sdk', sdk);
    // Get trading pairs from SDK
    const pairs = await sdk.getPairs({ type });
    console.log('pairs', pairs);

    return NextResponse.json({ pairs });
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return NextResponse.json({ error: 'Failed to fetch trading pairs' }, { status: 500 });
  }
}
