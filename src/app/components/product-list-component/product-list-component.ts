import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { Router, RouterLink } from '@angular/router';
import { UiMessageService } from '../../services/ui-message.service';

@Component({
  selector: 'app-product-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list-component.html',
  styleUrl: './product-list-component.scss'
})

export class ProductListComponent implements OnInit {

  private productService = inject(ProductService);
  products = signal<Product[]>([]);
  loading = this.productService.loading;

  pendingDeleteId = signal<number | null>(null);
  isDeleting = signal(false);


  constructor(
    private router: Router,
    public uiMessageService: UiMessageService) { }

  ngOnInit() {
    this.productService.getProducts().subscribe();
    this.products = this.productService.products;
  }

  editProduct(id: number) {
    this.router.navigate(['/products', id, 'edit']);
  }

  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;

    this.isDeleting.set(true);
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.uiMessageService.setSuccess('Produit supprimé avec succès!');
        this.productService.removeFromProducts(id);
      },
      error: (err) => {
        this.pendingDeleteId.set(null);
        this.isDeleting.set(false);
        this.uiMessageService.setError(`Echec:  ${err?.error?.message || 'erreur inconnue'}`);
      },
      complete: () => {
        this.pendingDeleteId.set(null);
        this.isDeleting.set(false);
      }
    });
  }
}
