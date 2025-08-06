import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../models/category.interface';
import { Observable, of, tap } from 'rxjs';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryApi = 'http://localhost:8080/api/categories';
  private http = inject(HttpClient);

  private cache = signal<Category[] | null>(null);
  categories = signal<Category[]>([]);
  loading = signal(false);

  constructor() {
  }

  getCategories(): Observable<Category[]> {
    const cached = this.cache();
    if (cached) {
      this.categories.set(cached);
      return of(cached);
    }
    this.loading.set(true);
    return this.http.get<Category[]>(this.categoryApi).pipe(
      tap(categories => {
        this.cache.set(categories);
        this.categories.set(categories);
        this.loading.set(false);

      })
    );
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.categoryApi}/${id}`)
  }

  saveCategory(category: Category): Observable<any> {
    return this.http.post(this.categoryApi, category);
  }

  // used after save to avoid complete reload
  addToCategories(category: Category) {
    const updated = [category, ...this.categories()];
    this.categories.set(updated);
    this.cache.set(updated);
  }

  updateCategory(category: Category): Observable<any> {
    return this.http.put(`${this.categoryApi}/${category.id}`, category);
  }

  updateInCategories(category: Category) {
    const updated = this.categories().map(cat =>
      cat.id === category.id ? category : cat
    );
    this.categories.set(updated);
    this.cache.set(updated);
  }

  deleteCategorie(id: number): Observable<any> {
    return this.http.delete<Category>(`${this.categoryApi}/${id}`);
  }

  // used after delete to avoid complete reload
  removeFromCategories(id: number) {
    const updated = this.categories().filter(cat => cat.id !== id);
    this.categories.set(updated);
    this.cache.set(updated);
  }

  clearCache() {
    this.cache.set(null);
  }

}
