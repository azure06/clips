interface Base {
  id: string;
  updatedAt: number;
  createdAt: number;
}

export interface Clip extends Base {
  plainText?: string;
  htmlText?: string;
  dataURI?: any;
  types: string[];
}
