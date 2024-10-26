import {
  ComputeBudgetProgram,
  RpcResponseAndContext,
  SignatureStatus,
  Transaction,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from '@solana/web3.js';
import { sleep } from './common';

type SendTransactionParams =
  | Transaction
  | TransactionInstruction
  | TransactionInstructionCtorFields;
export async function sendTransaction<T extends SendTransactionParams = SendTransactionParams>(
  transactions: T | T[],
) {
  if (!window.solanaWallet) throw new Error('solana Wallet not found');
  const { connection, sendTransaction, publicKey } = window.solanaWallet!;
  const { blockhash } = await connection.getLatestBlockhash();
  const transactionArray = Array.isArray(transactions) ? transactions : [transactions];

  const transaction = new Transaction()
    .add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 300000,
      }),
    )
    .add(...transactionArray);

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey!;

  const signature = await sendTransaction?.(transaction, connection, {
    skipPreflight: true,
    maxRetries: 3,
    preflightCommitment: 'finalized',
  });
  console.log('signature', signature);
  if (!signature) throw new Error('sendTransaction failed');
  const confirmation = await pollForTransactionConfirmation(signature);
  console.log('confirmation', confirmation);
  if (confirmation.value?.err) {
    throw new Error('sendTransaction failed on transaction with signature: ' + signature);
  }
  return signature;
}

async function pollForTransactionConfirmation(
  signature: string,
  timeout = 30000,
): Promise<RpcResponseAndContext<SignatureStatus | null>> {
  const startTime = Date.now();
  let done = false;
  let status: RpcResponseAndContext<SignatureStatus | null> | null = null;
  const { connection } = window.solanaWallet!;
  while (!done && Date.now() - startTime < timeout) {
    status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });
    if (status?.value?.confirmationStatus === 'finalized' || status?.value?.err) {
      done = true;
    } else {
      await sleep(2000);
    }
  }
  if (!status) {
    throw new Error(`Transaction confirmation failed for signature ${signature}`);
  }
  return status;
}
