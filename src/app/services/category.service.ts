import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/category.interface';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryApi = 'http://localhost:8080/api/categories';
  private categoryCache: Category[] | null = null;

  constructor(private http: HttpClient){}

  getCategories(): Observable<Category[ ]> {
    if(this.categoryCache){
      return of(this.categoryCache);
    }
    return this.http.get<Category[]>(this.categoryApi).pipe(
      tap(categories => this.categoryCache = categories)
    );
  }
  
}
