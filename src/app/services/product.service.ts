import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsApi = 'http://localhost:8080/api/products';

  private http = inject(HttpClient);

  products = signal<Product[]>([]);
  private cache = signal<Product[] | null>(null);
  loading = signal(false);

  constructor() {
    // this.fetchProducts();
  }
  
  // fetchProducts(): void {
  //   this.loading.set(true);
  //   this.http.get<Product[]>(this.productsApi).subscribe({
  //     next: (data) => this.products.set(data),
  //     error: (err) => {
  //       console.error('Error fetching products:', err);
  //       this.products.set([]);
  //       this.loading.set(false);
  //     },
  //     complete: () => this.loading.set(false),
  //   });
  // }

  getProducts(): Observable<Product[]> {
      const cached = this.cache();
      if (cached) {
        this.products.set(cached);
        return of(cached);
      }
      this.loading.set(true);
      return this.http.get<Product[]>(this.productsApi).pipe(
        tap(products => {
          this.cache.set(products);
          this.products.set(products);
          this.loading.set(false);
        })
      );
    }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productsApi}/${id}`)
  }

  saveProduct(product: Product): Observable<any> {
    return this.http.post(this.productsApi, product);
  }

  // used after save to avoid complete reload
    addToProducts(product: Product) {
      const updated = [product, ...this.products()];
      this.products.set(updated);
      this.cache.set(updated);
    }

  updateProduct(product: Product): Observable<any> {
    return this.http.put(`${this.productsApi}/${product.id}`, product);
  }

  updateInProducts(product: Product) {
      const updated = this.products().map(p =>
        p.id === product.id ? product : p
      );
      this.products.set(updated);
      this.cache.set(updated);
    }

  deleteProduct(id: number) : Observable<any> {
    return this.http.delete<Product>(`${this.productsApi}/${id}`);
  }

  // used after delete to avoid useless reload
  removeFromProducts(id: number) {
    const updated = this.products().filter(p => p.id !== id);
    this.products.set(updated);
    this.cache.set(updated);
  }

  clearCache() {
    this.cache.set(null);
  }
}
