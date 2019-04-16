interface Base {
  id: string;
  updatedAt: number;
  createdAt: number;
}

interface ViewDetails {
  textView: string;
  translationView: string;
  dateFromNow: string;
}

export interface Clip extends Partial<ViewDetails>, Base {
  plainText: string;
  htmlText?: string;
  reachText?: string;
  dataURI?: string;
  category: 'none' | 'starred';
  type: 'text' | 'image';
  formats: string[];
}

export interface QuillCard<T> {
  id?: number;
  title: string;
  plainText: string;
  contents: T;
  label: string;
  displayOrder: number;
  dateFromNow?: string;
  updatedAt: number;
  createdAt: number;
}

export interface UserInfo {
  displayName: string;
  emailAddress: string;
  kind: string;
  me: true;
  permissionId: string;
  photoLink: string;
}

/**
 * Translation result
 *
 */
export interface GoogleTranslateResult {
  originalText: string;
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
