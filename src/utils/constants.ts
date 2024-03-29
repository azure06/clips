export const SENDERS = {
  GET_BOUNDS_SYNC: 'GET_BOUNDS_SYNC',
};

export const INVOCATION = {
  REMOTE: {
    GET_CURRENT_WINDOW: 'GET_CURRENT_WINDOW',
    DIALOG: 'DIALOG',
  },
  ANALYTICS: {
    PAGE_VIEW: 'PAGE_VIEW',
  },
  CONF: {
    WITH_COMMAND: 'OPEN_WITH_VSCODE',
  },
  COPY_TO_CLIPBOARD: 'copy-to-clipboard',
  //
  TO_DATA_URI: 'to-dataURI',
  REMOVE_IMAGE: 'remove-image',
  REMOVE_IMAGE_DIRECTORY: 'remove-image-directory',
  //
  CREATE_BACKUP: 'create-backup',
  RESTORE_BACKUP: 'restore-backup',
  //
  MY_DEVICE: 'my-device',
  //
  HANDLE_SERVER: 'handle-server',
  SEND_FILE: 'send-file',
  // Payments
  CAN_MAKE_PAYMENTS: 'can-make-payments',
  GET_RECEIPT_URL: 'get-receipt-url',
  GET_PRODUCTS: 'get-products',
  PURCHASE_PRODUCT: 'purchase-product',
  RESTORE_COMPLETED_TRANSACTION: 'restore-completed-transactions',
  FINISH_TRANSACTION_BY_DATE: 'finish-transaction-by-date',

  //
  SIGN_IN: 'sign-in',
  SIGN_OUT: 'sign-out',

  //
  CHANGE_PAGE_TOKEN: 'change-page-token',
  LIST_FILES: 'list-files',
  RETRIEVE_FILE: 'retrieve-file',
  UPLOAD_TO_DRIVE: 'upload-to-drive',
  REMOVE_FILE: 'remove-file',

  //
  SET_SHORTCUT: 'set-shortcut',
  SET_STARTUP: 'set-startup',
  SET_ALWAYS_ON_TOP: 'set-always-on-top',
  SET_SKIP_TASKBAR: 'set-skip-taskbar',

  // Editor
  OPEN_EDITOR: 'open-editor',

  //
  RELAUNCH_APP: 'relaunch-app',

  //
  NODE_DB: 'nodedb',
};
