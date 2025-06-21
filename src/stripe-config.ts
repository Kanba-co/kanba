export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SXYd2yr1vYNQAB',
    priceId: 'price_1RcTWeR3fs8AWFoCKiv3AUvu',
    name: 'KanbanPro Monthly',
    description: 'Monthly subscription to KanbanPro with unlimited projects and advanced features',
    mode: 'subscription',
    price: 9.00,
    currency: 'usd',
    interval: 'month',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}