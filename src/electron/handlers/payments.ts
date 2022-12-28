//   Payments

import { ipcMain } from 'electron';

import { INVOCATION } from '@/utils/constants';
import { Result__ } from '@/utils/result';

export const onCanMakePayments = (
  func: () => Promise<Result__<boolean>>
): void => ipcMain.handle(INVOCATION.CAN_MAKE_PAYMENTS, func);

export const onGetReceiptUrl = (func: () => Promise<Result__<string>>): void =>
  ipcMain.handle(INVOCATION.GET_RECEIPT_URL, func);

export const onGetProducts = (
  func: (productIds: string[]) => Promise<Result__<Electron.Product[]>>
): void =>
  ipcMain.handle(INVOCATION.GET_PRODUCTS, (_, productIds) => func(productIds));

export const onPurchaseProduct = (
  func: (
    product: Electron.Product,
    quantity?: number
  ) => Promise<Result__<boolean>>
): void =>
  ipcMain.handle(INVOCATION.PURCHASE_PRODUCT, (_, product, quantity) =>
    func(product, quantity)
  );

export const onRestoreCompletedTransactions = (
  func: () => Promise<Result__<void>>
): void => ipcMain.handle(INVOCATION.RESTORE_COMPLETED_TRANSACTION, func);

export const onFinishTransactionByDate = (
  func: (date: string) => Promise<Result__<void>>
): void =>
  ipcMain.handle(INVOCATION.FINISH_TRANSACTION_BY_DATE, (_, date) =>
    func(date)
  );
