interface Base {
  id: string;
  updatedAt: number;
  createdAt: number;
}

interface ViewDetails {
  plainView: string;
  htmlView: string;
  imagePreview: string;
  translationView: string;
  dateFromNow: string;
}

export interface Clip extends Partial<ViewDetails>, Base {
  plainText: string;
  htmlText?: string;
  dataURI?: string;
  category: 'none' | 'starred';
  type: 'text' | 'image';
  formats: string[];
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
