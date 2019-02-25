interface Base {
  id: string;
  updatedAt: number;
  createdAt: number;
}

interface Bookmark {
  starred: boolean;
}

export interface Clip extends Bookmark, Base {
  plainText?: string;
  htmlText?: string;
  dataURI?: any;
  types: string[];
}

/**
 *
 *
 */
export interface GoogleTraslateResult {
  text: string;
  from: {
    language: {
      didYouMean: boolean;
      iso: string;
    };
    text: {
      autoCorrected: boolean;
      value: string;
      didYouMean: boolean;
    };
    raw: string;
  };
}
