// Main process
import { inAppPurchase } from 'electron';

import { empty, whenMacOS } from '@/utils/environment';

export const PRODUCT_IDS = ['clips_premium'];

// Listen for transactions as soon as possible.
export const onTransactionUpdate = (
  func: (event: Event, transactions: Electron.Transaction[]) => void
): Electron.InAppPurchase | void =>
  whenMacOS<Electron.InAppPurchase | void>(
    () => inAppPurchase.on('transactions-updated', func),
    empty
  );

// Retrieve and display the product descriptions.
export const getProducts = (
  productIds: string[] = PRODUCT_IDS
): Promise<Electron.Product[]> => inAppPurchase.getProducts(productIds);

// Check if the user is allowed to make in-app purchase.
export const canMakePayments = (): boolean => inAppPurchase.canMakePayments();

// Returns if product is valid (Valid? => Proceed to purchase)
export const purchaseProduct = (
  product: Electron.Product,
  quantity = 1
): Promise<boolean> =>
  inAppPurchase.purchaseProduct(product.productIdentifier, quantity);

export const restoreCompletedTransactions =
  inAppPurchase.restoreCompletedTransactions;

export const getReceiptURL = inAppPurchase.getReceiptURL;

export const finishTransactionByDate = inAppPurchase.finishTransactionByDate;
