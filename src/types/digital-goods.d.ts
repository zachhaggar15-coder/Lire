interface DigitalGoodsPrice {
  currency: string;
  value: string;
}

interface DigitalGoodsItemDetails {
  itemId: string;
  title: string;
  description: string;
  price: DigitalGoodsPrice;
  /** ISO 8601 duration, e.g. "P1M". */
  subscriptionPeriod?: string;
  /** ISO 8601 duration of a free trial, if the Play product offers one. */
  freeTrialPeriod?: string;
  introductoryPrice?: DigitalGoodsPrice;
  introductoryPricePeriod?: string;
}

interface DigitalGoodsPurchase {
  itemId: string;
  purchaseToken: string;
}

interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<DigitalGoodsItemDetails[]>;
  listPurchases(): Promise<DigitalGoodsPurchase[]>;
}

interface Window {
  getDigitalGoodsService?: (paymentMethod: string) => Promise<DigitalGoodsService>;
}
