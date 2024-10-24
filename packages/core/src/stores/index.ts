import { SDKParams } from '@/index';

interface GlobalStateType extends SDKParams {}

class GlobalState {
  private static instance: GlobalState;
  private state: GlobalStateType = {
    chain: 'near',
    network: 'mainnet',
  };

  private constructor() {}

  public static getInstance(): GlobalState {
    if (!GlobalState.instance) {
      GlobalState.instance = new GlobalState();
    }
    return GlobalState.instance;
  }

  public set<K extends keyof GlobalStateType>(key: K, value: GlobalStateType[K]): void {
    this.state[key] = value;
  }

  public get<K extends keyof GlobalStateType>(key: K): GlobalStateType[K] {
    return this.state[key];
  }

  public remove<K extends keyof GlobalStateType>(key: K): void {
    delete this.state[key];
  }
}

export const globalState = GlobalState.getInstance();
