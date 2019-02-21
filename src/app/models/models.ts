interface Base {
  id: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface Clip extends Partial<Base> {
  content: string;
  type: string;
}
