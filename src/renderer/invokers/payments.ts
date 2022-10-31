import { ipcRenderer } from 'electron';
import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';

/** In App Purchase */
export const canMakePayments = (): Promise<Result__<boolean>> =>
  ipcRenderer.invoke(INVOCATION.CAN_MAKE_PAYMENTS);

export const getReceiptURL = (): Promise<Result__<string>> =>
  ipcRenderer.invoke(INVOCATION.GET_RECEIPT_URL);

export const getProducts = (
  productIds?: string[]
): Promise<Result__<Electron.Product[]>> =>
  ipcRenderer.invoke(INVOCATION.GET_PRODUCTS, productIds);

// Returns if product is valid
export const purchaseProduct = (
  product: Electron.Product
): Promise<Result__<boolean>> =>
  ipcRenderer.invoke(INVOCATION.PURCHASE_PRODUCT, product);

export const restoreCompletedTransactions = (): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.RESTORE_COMPLETED_TRANSACTION);

export const finishTransactionByDate = (
  date: string
): Promise<Result__<void>> =>
  ipcRenderer.invoke(INVOCATION.FINISH_TRANSACTION_BY_DATE, date);
