interface Base {
  id: string;
  updatedAt: string;
  createdAt: string;
}

export interface Clip extends Partial<Base> {
  content: string;
  type: string;
}
