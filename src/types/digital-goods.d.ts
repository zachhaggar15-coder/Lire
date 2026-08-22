interface DigitalGoodsPrice {
  currency: string;
  value: string;
}

interface DigitalGoodsItemDetails {
  itemId: string;
  title: string;
  description: string;
  price: DigitalGoodsPrice;
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
