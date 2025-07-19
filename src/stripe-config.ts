export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  allow_promotion_codes: boolean;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_Si2r3Gt3xtmwER',
    priceId: 'price_1Rmcm6R1k9dZk2ZUktVYH81E', 
    name: 'Kanba Pro',
    description: 'Monthly subscription to Kanba with unlimited projects and advanced features',
    mode: 'subscription',
    allow_promotion_codes: true,
    price: 4.90,
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