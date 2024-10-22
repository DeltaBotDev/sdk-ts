import { globalState } from '@/stores';

export async function generateReferralUrl() {
  const accountId = globalState.get('accountId');
  const chain = globalState.get('chain');
  const network = globalState.get('network');
  if (!accountId) throw new Error('Please set accountId before generating referral url');
  const host = network === 'mainnet' ? 'https://www.deltatrade.ai' : 'https://dev.deltabot.vip/';
  return `${host}?ref=${accountId}&chain=${chain}`;
}
