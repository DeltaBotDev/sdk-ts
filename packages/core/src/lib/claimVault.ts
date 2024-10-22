import { BotContractServices, botNearContractServices } from '@/services/bot/contract';
import { globalState } from '@/stores';
import { botSolanaContractServices } from '@/services/bot/contract';

export async function claimGridVault<ChainType extends Chain>(params: {
  botId: number;
}): Promise<ReturnType<BotContractServices<ChainType>['claimGridBot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.claimGridBot(params.botId)
      : botSolanaContractServices.claimGridBot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['claimGridBot']>;
}

export async function claimDCAVault<ChainType extends Chain>(params: {
  botId: string;
}): Promise<ReturnType<BotContractServices<ChainType>['claimDCABot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.claimDCABot(params.botId)
      : botSolanaContractServices.claimDCABot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['claimDCABot']>;
}
