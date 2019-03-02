interface Base {
  id: string;
  updatedAt: number;
  createdAt: number;
}

interface Bookmark {
  categories: Array<'starred'>;
}

interface ViewDetails {
  plainView: string;
  htmlView: string;
  translationView: string;
  dateFromNow: string;
}

export interface Clip extends Partial<ViewDetails>, Bookmark, Base {
  plainText: string;
  htmlText: string;
  dataURI?: string;
  formats: string[];
  type: 'text' | 'image';
}

/**
 * Translation result
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
