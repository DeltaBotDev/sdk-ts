import { marketServices } from '@/services/bot';

export async function getMarketInfo() {
  const res = await marketServices.querySummary();
  return res;
}
