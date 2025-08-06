import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { take } from 'rxjs';
import { UiMessageService } from '../../services/ui-message.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-category-form-component',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './category-form-component.html',
  styleUrl: './category-form-component.scss'
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  public uiMessageService = inject(UiMessageService);

  isSubmitting = signal(false);
  categoryForm!: FormGroup;
  categoryId: number | null = null;

  ngOnInit(): void {
    this.buildForm();

    this.route.paramMap.pipe(take(1)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.categoryId = +id;
        this.loadCategory(this.categoryId);
      }
    });
  }

  private buildForm() {
    this.categoryForm = this.fb.group({
      category_code: ['', Validators.required],
      category_name: ['', Validators.required]
    });
  }

  private loadCategory(id: number) {
    this.categoryService.getCategory(id).subscribe({
      next: (category) => this.categoryForm.patchValue(category),
      error: (err) => console.error('Failed to load category', err)
    });
  }

  onSubmit() {
    if (!this.categoryForm.valid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const data = this.categoryForm.value;

    const request$ = this.categoryId
      ? this.categoryService.updateCategory({ ...data, id: this.categoryId })
      : this.categoryService.saveCategory(data);

    request$.subscribe({
      next: (response) => {
        const action = this.categoryId ? 'modifiée' : 'ajoutée';
        this.handleSuccess(response, action);
        if (this.categoryId) {
          this.categoryService.updateInCategories(response);
        } else {
          this.categoryService.addToCategories(response);
        }
      },
      error: err => this.handleError(err, this.categoryId ? 'modification' : 'création'),
      complete: () => this.isSubmitting.set(false)
    });
  }

  private handleError(err: any, action: string) {
    console.error(`${action} failed`, err);
    this.uiMessageService.setError(`Échec de la ${action} de la catégorie: ${err?.error?.message || 'erreur inconnue'}`);
    this.isSubmitting.set(false);
  }

  private handleSuccess(response: any, action: string) {
    console.log(`${action} succeeded`, response);
    this.uiMessageService.setSuccess(`Catégorie ${action} avec succès`);
    this.router.navigate(['/categories'], { state: { refresh: true } });
  }

}

