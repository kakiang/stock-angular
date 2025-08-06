import { Component, OnInit, Signal, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { UiMessageService } from '../../services/ui-message.service';
import { take } from 'rxjs';
import { Product } from '../../models/product.interface';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-product-form-component',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './product-form-component.html',
  styleUrl: './product-form-component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isSubmitting = signal(false);
  productId: number | null = null;
  categories!: Signal<Category[]>;;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    public uiMessageService: UiMessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.buildForm();
    this.categoryService.getCategories().subscribe();
    this.categories = this.categoryService.categories;

    this.route.paramMap
      .pipe(take(1))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.productId = +id;
          this.loadProduct(this.productId);
        }
      });
  }

  private buildForm() {
    this.productForm = this.fb.group({
      product_code: ['', Validators.required],
      product_name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      category: this.fb.group({
        id: [null, Validators.required]
      })
    });
  }

  loadProduct(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (product) => this.productForm.patchValue(product),
      error: (err) => console.error('Failed to load product', err)
    });
  }

  get categoryGroup(): FormGroup {
    return this.productForm.get('category') as FormGroup;
  }

  onSubmit() {
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const productData = this.productForm.value;

    if (this.productId) {
      this.update(productData);
    } else {
      this.create(productData);
    }
  }

  private create(productData: Product) {
    this.productService.saveProduct(productData).subscribe({
      next: response => {
        this.handleSuccess(response, "ajouté");
        this.productService.addToProducts(response);
      },
      error: (err) => {
        this.handleError(err, `création du produit ${productData.product_name}`);
        this.isSubmitting.set(false);
      },
      complete: () => this.isSubmitting.set(false)
    });
  }

  private update(productData: Product) {
    productData.id = this.productId!;
    this.productService.updateProduct(productData).subscribe({
      next: response => {
        this.handleSuccess(response, "modifié");
        this.productService.updateInProducts(response);
      },
      error: (err) => this.handleError(err, `mise à jour du produit ${productData.product_name}`),
      complete: () => this.isSubmitting.set(false)
    });
  }

  private handleError(err: any, action: string) {
    console.error(`${action} failed`, err);
    this.uiMessageService.setError(`Échec de la ${action}: ${err?.error?.message}.`);
    this.isSubmitting.set(false);
  }

  private handleSuccess(response: any, action: string) {
    console.log(`succès ${action}`, response);
    this.uiMessageService.setSuccess(`Produit ${action} avec succès`);
    this.router.navigate(['/products'], { state: { refresh: true } });
  }
}

