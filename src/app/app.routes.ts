import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list-component/product-list-component';
import { ProductFormComponent } from './components/product-form-component/product-form-component';

export const routes: Routes = [
    { path: 'products', component: ProductListComponent},
    { path: 'products/new', component: ProductFormComponent},
    { path: 'products/:id/edit', component: ProductFormComponent},
    { path: '', redirectTo: 'products', pathMatch: 'full' }, 
    { path: '**', redirectTo: 'products' }
];
