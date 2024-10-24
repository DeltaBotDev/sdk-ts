import { getConfigs } from '@/config';
import { globalState } from '@/stores';
import { Chain } from '../types/contract';

export { default as request } from '@/utils/request';

export interface WrapperResponse<T> {
  code: number;
  data?: T;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export type PaginationResponse<T> = WrapperResponse<
  { list?: T[]; has_next_page: boolean } | undefined
>;

export const botInnerApiPrefix = (url: string, chain?: Chain) => {
  const _chain = chain || globalState.get('chain');
  const host = _chain === 'solana' ? getConfigs().solanaApiHost : getConfigs().apiHost;
  return host + '/api' + url;
};
