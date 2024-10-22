'use client';

import {
  type DependencyList,
  type EffectCallback,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { debounce, type DebounceSettings } from 'lodash-es';
import { storageStore } from '../utils/common';

export function useClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return { isClient };
}

type DebounceOptions = number | ({ wait: number } & Partial<DebounceSettings>);
type RequestOptions<T> = {
  refreshDeps?: React.DependencyList;
  before?: () => boolean | undefined;
  manual?: boolean;
  onSuccess?: (res: T) => void;
  onError?: (err: Error) => void;
  debounceOptions?: DebounceOptions;
  retryCount?: number;
  retryInterval?: number;
  pollingInterval?: number;
};

export function useRequest<T>(request: () => Promise<T>, options?: RequestOptions<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const {
    refreshDeps = [],
    before,
    manual,
    onSuccess,
    onError,
    debounceOptions,
    retryCount = 0,
    retryInterval = 0,
    pollingInterval,
  } = useMemo(() => options || {}, [options]);

  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const clearPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  const run = useCallback(async () => {
    clearPolling();
    let attempts = 0;

    const executeRequest = async () => {
      try {
        setLoading(true);
        const res = await request();
        setData(res);
        onSuccess?.(res);
        return true;
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error(String(err)));
        onError?.(err instanceof Error ? err : new Error(String(err)));
        return false;
      } finally {
        setLoading(false);
      }
    };

    const attemptRequest = async () => {
      const success = await executeRequest();
      if (!success && attempts < retryCount) {
        attempts += 1;
        setTimeout(attemptRequest, retryInterval);
      }
    };

    if (before && !before()) return;
    attemptRequest();

    if (pollingInterval) {
      pollingTimer.current = setTimeout(run, pollingInterval);
    }
  }, [
    clearPolling,
    before,
    pollingInterval,
    request,
    onSuccess,
    onError,
    retryCount,
    retryInterval,
  ]);

  useDebouncedEffect(
    () => {
      if (manual) return;
      if (before && !before()) return;
      clearPolling();
      run();
      return () => clearPolling();
    },
    [...refreshDeps, clearPolling],
    debounceOptions,
  );

  return {
    run,
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    clearPolling,
  };
}

export function useDebouncedEffect(
  effect: EffectCallback,
  deps: React.DependencyList,
  debounceOptions?: DebounceOptions,
) {
  useEffect(() => {
    const options =
      typeof debounceOptions === 'number' ? { wait: debounceOptions } : debounceOptions;
    const debouncedEffect = debounce(
      () => {
        const cleanupFn = effect();
        if (cleanupFn) {
          debouncedEffect.flush = cleanupFn as any;
        }
      },
      options?.wait,
      options,
    );

    debouncedEffect();

    return () => {
      debouncedEffect.cancel();
      if (debouncedEffect.flush) {
        debouncedEffect.flush();
      }
    };
  }, [...deps]);
}

export function useDebouncedMemo<T>(
  factory: () => T,
  deps: DependencyList,
  debounceOptions?: DebounceOptions,
) {
  const options = useMemo(() => {
    return typeof debounceOptions === 'number' ? { wait: debounceOptions } : debounceOptions;
  }, [debounceOptions]);

  const [debouncedValue, setDebouncedValue] = useState<T>(() => factory());

  const debouncedUpdate = useMemo(
    () =>
      debounce(
        () => {
          setDebouncedValue(factory());
        },
        options?.wait || 300,
        options,
      ),
    [options, factory],
  );

  useEffect(() => {
    debouncedUpdate();

    return () => {
      debouncedUpdate.cancel();
    };
  }, [...deps, debouncedUpdate]);

  return debouncedValue;
}

export function useStorageState<T>(
  key: string,
  defaultValue: T,
  options?: { storage?: Storage; namespace?: string },
) {
  const { storage, namespace = 'DELTA_DEFAULT' } = options || {};
  const storageAPI = storageStore(namespace, { storage });
  const [state, _setState] = useState<T>(() => {
    const storedValue = storageAPI?.get(key) as T;
    return storedValue !== undefined ? storedValue : defaultValue;
  });

  const setState: typeof _setState = (value) => {
    _setState(value);
    const _value = typeof value === 'function' ? (value as any)(state) : value;
    if (_value === undefined) {
      storageAPI?.remove(key);
    } else {
      storageAPI?.set(key, _value);
    }
  };

  return [state, setState] as const;
}
