import { Category } from "./category.interface";

export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  price: number;
  category: Category;
}