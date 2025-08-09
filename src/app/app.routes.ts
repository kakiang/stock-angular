import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list-component/product-list-component';
import { ProductFormComponent } from './components/product-form-component/product-form-component';
import { CategoryListComponent } from './components/category-list-component/category-list-component';
import { CategoryFormComponent } from './components/category-form-component/category-form-component';
import { LoginComponent } from './authentication/login-component/login-component';
import { authGuard } from './authentication/auth-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent},
    { path: 'products', component: ProductListComponent},
    { path: 'products/new', component: ProductFormComponent, canActivate: [authGuard] },
    { path: 'products/:id/edit', component: ProductFormComponent, canActivate: [authGuard]},
    { path: 'categories', component: CategoryListComponent},
    { path: 'categories/new', component: CategoryFormComponent, canActivate: [authGuard]},
    { path: 'categories/:id/edit', component: CategoryFormComponent, canActivate: [authGuard]},
    { path: '', redirectTo: 'products', pathMatch: 'full' }, 
    { path: '**', redirectTo: 'products' }
];
