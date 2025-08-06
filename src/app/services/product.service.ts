import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsApi = 'http://localhost:8080/api/products';

  private http = inject(HttpClient);

  products = signal<Product[]>([]);
  loading = signal(false);

  constructor() {
    this.fetchProducts();
  }
  
  fetchProducts(): void {
    this.loading.set(true);
    this.http.get<Product[]>(this.productsApi).subscribe({
      next: (data) => this.products.set(data),
      error: (err) => {
        console.error('Error fetching products:', err);
        this.products.set([]);
      },
      complete: () => this.loading.set(false),
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsApi}/${id}`)
  }

  saveProduct(product: Product): Observable<any> {
    return this.http.post(this.productsApi, product);
  }

  updateProduct(product: Product): Observable<any> {
    return this.http.put(`${this.productsApi}/${product.id}`, product);
  }

  deleteProduct(id: number) : Observable<Product> {
    return this.http.delete<Product>(`${this.productsApi}/${id}`)
  }
}
