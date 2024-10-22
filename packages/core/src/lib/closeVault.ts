import {
  BotContractServices,
  botNearContractServices,
  botSolanaContractServices,
} from '@/services/bot/contract';
import { globalState } from '@/stores';

export async function closeGridVault<ChainType extends Chain>(params: {
  botId: number;
}): Promise<ReturnType<BotContractServices<ChainType>['closeGridBot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.closeGridBot(params.botId)
      : botSolanaContractServices.closeGridBot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['closeGridBot']>;
}

export async function closeDCAVault<ChainType extends Chain>(params: {
  botId: string;
}): Promise<ReturnType<BotContractServices<ChainType>['closeDCABot']>> {
  const chain = globalState.get('chain') as ChainType;
  const trans =
    chain === 'near'
      ? botNearContractServices.closeDCABot(params.botId)
      : botSolanaContractServices.closeDCABot(params.botId);
  return trans as ReturnType<BotContractServices<ChainType>['closeDCABot']>;
}
