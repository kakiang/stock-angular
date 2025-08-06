import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { UiMessageService } from '../../services/ui-message.service';

@Component({
  selector: 'app-product-form-component',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './product-form-component.html',
  styleUrl: './product-form-component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  successMessage = '';
  errorMessage = '';
  isSubmitting = signal(false);

  productId: number | null = null;


  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    public uiMessageService: UiMessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      product_code: ['', Validators.required],
      product_name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      category: this.fb.group({
        id: [null, Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;
        this.loadProduct(this.productId);
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: cats => this.categories = cats,
      error: err => console.error('Failed to load categories', err)
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
    if (this.productForm.valid) {
      this.isSubmitting.set(true);
      const productData = this.productForm.value;

      if (this.productId) {

        productData.id = this.productId;
        this.productService.updateProduct(productData).subscribe({
          next: response => this.success(response, "modifié"),
          error: (err) => { this.failure(err, "update"); this.isSubmitting.set(false); },
          complete: () => this.isSubmitting.set(false)
        });

      } else {

        this.productService.saveProduct(productData).subscribe({
          next: response => this.success(response, "ajouté"),
          error: (err) => { this.failure(err, "Save"); this.isSubmitting.set(false); },
          complete: () => this.isSubmitting.set(false)
        });
      }

    } else {
      this.productForm.markAllAsTouched();
    }
  }
  private failure(err: any, operation: string) {
    console.error(`${operation} failed`, err);
    this.errorMessage = `Echec: ${err?.error?.message}.`;;
    this.successMessage = '';
    this.uiMessageService.setError(this.errorMessage);
  }

  private success(response: any, operation: string) {
    console.log(`Produit ${operation}`, response);
    this.successMessage = `Produit ${operation} avec succès`;
    this.errorMessage = '';
    this.productForm.reset();
    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
    this.router.navigate(['/products'], { state: { refresh: true }});
    this.uiMessageService.setSuccess(this.successMessage);
  }
}

