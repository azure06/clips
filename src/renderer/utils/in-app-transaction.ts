import { finishTransactionByDate, getReceiptURL } from '../invokers';

export const handleTransaction = async (
  func: (transaction: Electron.Transaction) => void,
  transactions: Electron.Transaction[]
): Promise<void> => {
  if (!Array.isArray(transactions)) return Promise.resolve();
  // Check each transaction.
  await Promise.all(
    transactions.map(async function (transaction) {
      const payment = transaction.payment;

      switch (transaction.transactionState) {
        case 'purchasing':
          console.info(`Purchasing ${payment.productIdentifier}...`);
          break;

        case 'purchased': {
          console.info(`${payment.productIdentifier} purchased.`);

          // Get the receipt url.
          const receiptURL = await getReceiptURL();

          console.info(`Receipt URL: ${receiptURL}`);

          // Submit the receipt file to the server and check if it is valid.
          // @see https://developer.apple.com/library/content/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
          // ...
          // If the receipt is valid, the product is purchased
          // ...

          // Finish the transaction.
          await finishTransactionByDate(transaction.transactionDate);

          break;
        }

        case 'failed':
          console.info(`Failed to purchase ${payment.productIdentifier}.`);

          // Finish the transaction.
          await finishTransactionByDate(transaction.transactionDate);
          break;
        case 'restored':
          console.info(
            `The purchase of ${payment.productIdentifier} has been restored.`
          );

          break;
        case 'deferred':
          console.info(
            `The purchase of ${payment.productIdentifier} has been deferred.`
          );

          break;
        default:
          break;
      }
      func(transaction);
    })
  );
};
