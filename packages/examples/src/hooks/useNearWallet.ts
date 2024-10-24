import {
  setupWalletSelector,
  type WalletSelector,
  type Wallet,
  type AccountState,
} from '@near-wallet-selector/core';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupNightly } from '@near-wallet-selector/nightly';
import { type WalletSelectorModal, setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { useEffect, useState } from 'react';
import { type SignMessageMethod } from '@near-wallet-selector/core/src/lib/wallet';
import { useDebouncedEffect } from './useHooks';
import { distinctUntilChanged, map } from 'rxjs';

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

export default function useNearWallet() {
  const [walletSelectorModal, setWalletSelectorModal] = useState<WalletSelectorModal>();
  const [walletSelector, setWalletSelector] = useState<WalletSelector>();
  const [wallet, setWallet] = useState<NearWallet>();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accountId, setAccountId] = useState<string>();

  useDebouncedEffect(
    () => {
      initWallet().catch((err) => {
        console.error(err);
        alert('Failed to initialize wallet selector');
      });
    },
    [],
    0,
  );

  useEffect(() => {
    if (!walletSelector) return;
    const subscription = walletSelector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged(),
      )
      .subscribe((nextAccounts) => {
        handleSignIn(nextAccounts);
      });

    const onHideSubscription = walletSelectorModal!.on('onHide', ({ hideReason }) => {
      console.log(`The reason for hiding the modal ${hideReason}`);
    });

    return () => {
      subscription.unsubscribe();
      onHideSubscription.remove();
    };
  }, [walletSelector, walletSelectorModal]);

  async function initWallet() {
    const modules = [setupMyNearWallet(), setupMeteorWallet(), setupNightly()];
    const selector = await setupWalletSelector({
      network: 'testnet',
      modules,
    });
    setWalletSelector(selector);
    window.nearWalletSelector = selector;

    const modal = setupModal(selector, {
      contractId: '',
    });
    setWalletSelectorModal(modal);

    const state = selector.store.getState();
    handleSignIn(state.accounts);
  }

  async function selectWallet() {
    walletSelectorModal?.show();
  }

  async function handleSignIn(accounts: AccountState[]) {
    try {
      const account = accounts.find((account) => account.active);
      const isSignedIn = !!account;
      setIsSignedIn(isSignedIn);
      setAccountId(process.env.NEXT_PUBLIC_TEST_NEAR_ACCOUNT || account?.accountId);
      const wallet = await walletSelector?.wallet();
      setWallet(wallet);
    } catch (error) {
      console.error('handleSignIn error', error);
    }
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

  return {
    walletSelectorModal,
    walletSelector,
    wallet,
    isSignedIn,
    selectWallet,
    disconnect,
    accountId,
  };
}
