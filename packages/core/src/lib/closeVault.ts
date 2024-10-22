import { botNearContractServices, botSolanaContractServices } from '@/services/bot/contract';
import { globalState } from '@/stores';

export async function closeNearGridVault(params: { botId: number }) {
  if (!globalState.get('accountId')) throw new Error('Please set accountId before closing a vault');
  return botNearContractServices.closeGridBot(params.botId);
}

export async function closeNearSwingVault(params: { botId: number }) {
  if (!globalState.get('accountId')) throw new Error('Please set accountId before closing a vault');
  return botNearContractServices.closeGridBot(params.botId);
}

export async function closeNearDCAVault(params: { botId: string }) {
  if (!globalState.get('accountId')) throw new Error('Please set accountId before closing a vault');
  return botNearContractServices.closeDCABot(params.botId);
}

export async function closeSolanaGridVault(params: { botId: number }) {
  if (!globalState.get('accountId')) throw new Error('Please set accountId before closing a vault');
  return botSolanaContractServices.closeGridBot(params.botId);
}

export async function closeSolanaSwingVault(params: { botId: number }) {
  if (!globalState.get('accountId')) throw new Error('Please set accountId before closing a vault');
  return botSolanaContractServices.closeGridBot(params.botId);
}
