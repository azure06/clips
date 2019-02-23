interface Base {
  id: string;
  updatedAt: Date | string;
  createdAt: Date | string;
}

export interface Clip extends Base {
  plainText?: string;
  htmlText?: string;
  dataURI?: any;
  types: string[];
}
