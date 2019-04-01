interface EventTracker {
  trackEvent: (
    category: string,
    action: string,
    label: string,
    value: number
  ) => void;
  visitor: any;
}

/**
 * Augment the Node.js namespace with a global declaration
 */
declare namespace NodeJS {
  interface Global {
    eventTracker: EventTracker;
  }
}
