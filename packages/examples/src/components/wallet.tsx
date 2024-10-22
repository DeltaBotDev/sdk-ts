'use client';
import { setupWalletSelector, Wallet, WalletSelector } from '@near-wallet-selector/core';
import { type WalletSelectorModal, setupModal } from '@near-wallet-selector/modal-ui';
import { SignMessageMethod } from '@near-wallet-selector/core/src/lib/wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { useEffect, useState } from 'react';
import '@near-wallet-selector/modal-ui/styles.css';
import { Button } from '@nextui-org/react';

declare global {
  interface Window {
    nearWalletSelector?: WalletSelector;
    nearWallet?: NearWallet;
  }
}

type NearWallet = Wallet &
  SignMessageMethod & {
    selectWallet?: () => void;
    isSignedIn?: boolean;
    accountId?: string;
    disconnect?: () => void;
  };

export default function WalletInfo() {
  const [walletSelectorModal, setWalletSelectorModal] = useState<WalletSelectorModal>();
  const [wallet, setWallet] = useState<NearWallet>();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accountId, setAccountId] = useState<string>();

  useEffect(() => {
    initWallet().catch((err) => {
      console.error(err);
    });
    setTimeout(() => {
      console.log('near wallet signedIn');
      window.nearWalletSelector?.on('signedIn', handleSignIn);
      window.nearWalletSelector?.on('accountsChanged', handleSignIn);
    }, 500);

    return () => {
      console.log('near wallet signedIn off');
      window.nearWalletSelector?.off('signedIn', handleSignIn);
      window.nearWalletSelector?.off('accountsChanged', handleSignIn);
    };
  }, []);

  async function initWallet() {
    const selector = await setupWalletSelector({
      network: 'testnet',
      debug: true,
      modules: [setupMyNearWallet()],
    });
    window.nearWalletSelector = selector;

    const modal = setupModal(selector, {
      contractId: '',
    });
    setWalletSelectorModal(modal);

    if (selector.isSignedIn()) {
      handleSignIn();
    }
  }

  async function selectWallet() {
    walletSelectorModal?.show();
  }

  async function handleSignIn() {
    const wallet = await window.nearWalletSelector?.wallet();
    setWallet(wallet);
    const accountId = (await wallet?.getAccounts())?.[0].accountId;
    console.log('handleSignIn', accountId);
    setAccountId(accountId);
  }

  async function disconnect() {
    try {
      await wallet?.signOut();
      setIsSignedIn(false);
      setAccountId(undefined);
      setWallet(undefined);
    } catch (error) {
      console.error('disconnect error', error);
    }
  }

  useEffect(() => {
    window.nearWallet = {
      ...wallet,
      selectWallet,
      disconnect,
      isSignedIn,
      accountId,
    } as NearWallet;
  }, [wallet, isSignedIn, accountId]);

  return (
    <div className="card flex items-center gap-5">
      <div className="flex items-center gap-5">
        <Button onClick={selectWallet}>Select Wallet</Button>
        <Button onClick={disconnect}>Disconnect</Button>
      </div>
      <p>Connected: {accountId}</p>
    </div>
  );
}
