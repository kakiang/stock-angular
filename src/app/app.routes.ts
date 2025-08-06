import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list-component/product-list-component';
import { ProductFormComponent } from './components/product-form-component/product-form-component';
import { CategoryListComponent } from './components/category-list-component/category-list-component';
import { CategoryFormComponent } from './components/category-form-component/category-form-component';

export const routes: Routes = [
    { path: 'products', component: ProductListComponent},
    { path: 'products/new', component: ProductFormComponent},
    { path: 'products/:id/edit', component: ProductFormComponent},
    { path: 'categories', component: CategoryListComponent},
    { path: 'categories/new', component: CategoryFormComponent},
    { path: 'categories/:id/edit', component: CategoryFormComponent},
    { path: '', redirectTo: 'products', pathMatch: 'full' }, 
    { path: '**', redirectTo: 'products' }
];
