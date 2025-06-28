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
    id: 'prod_SaCs4NEjB7rqbz',
    priceId: 'price_1Rf2SWJoSiKWb2MdjwYURJeV',
    name: 'Kanba Monthly',
    description: 'Monthly subscription to Kanba with unlimited projects and advanced features',
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