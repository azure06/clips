interface Base {
  id: string;
  updatedAt: string;
  createdAt: string;
}

interface Clip extends Partial<Base> {
  content: string;
  type: string;
}
