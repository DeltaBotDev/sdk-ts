import { botNearContractServices } from '@/services/bot/contract';
import { globalState } from '@/stores';
import { botSolanaContractServices } from '@/services/bot/contract';

export async function claimNearGridVault(params: { botId: number }) {
  if (!globalState.get('accountId'))
    throw new Error('Please set accountId before claiming a vault');
  return botNearContractServices.claimGridBot(params.botId);
}

export async function claimNearSwingVault(params: { botId: number }) {
  if (!globalState.get('accountId'))
    throw new Error('Please set accountId before claiming a vault');
  return botNearContractServices.claimGridBot(params.botId);
}

export async function claimNearDCAVault(params: { botId: string }) {
  if (!globalState.get('accountId'))
    throw new Error('Please set accountId before claiming a vault');
  return botNearContractServices.claimDCABot(params.botId);
}

export async function claimSolanaGridVault(params: { botId: number }) {
  if (!globalState.get('accountId'))
    throw new Error('Please set accountId before claiming a vault');
  return botSolanaContractServices.claimGridBot(params.botId);
}

export async function claimSolanaSwingVault(params: { botId: number }) {
  if (!globalState.get('accountId'))
    throw new Error('Please set accountId before claiming a vault');
  return botSolanaContractServices.claimGridBot(params.botId);
}
