/**
 * Augment the Node.js namespace with a global declaration for the Twilio.js library.
 */
declare namespace NodeJS {
  interface Global {
    trackEvent: (
      category: string,
      action: string,
      label: string,
      value: number
    ) => void;
  }
}
