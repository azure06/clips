interface Base {
  id: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface Clip extends Partial<Base> {
  plainText?: string;
  htmlText?: string;
  dataUri?: any;
  types: string[];
}
