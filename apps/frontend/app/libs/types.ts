// app/libs/types.ts

export interface Product {
  id: number;
  title: string;
  description: string;
  url: string;
  priceCents: number;
  imageUrl?: string;
  embeddingId?: string;
  createdAt: string | Date;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
