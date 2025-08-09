import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { UiMessageService } from '../../services/ui-message.service';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../models/category.interface';
import { AUTH_STATE } from '../../authentication/auth-state';

@Component({
  selector: 'app-category-list-component',
  imports: [RouterLink],
  templateUrl: './category-list-component.html',
  styleUrl: './category-list-component.scss'
})
export class CategoryListComponent implements OnInit {

  private categoryService = inject(CategoryService);
  categories!: Signal<Category[]>;;
  loading = this.categoryService.loading;

  isAuth: Signal<boolean> = inject(AUTH_STATE);
  pendingDeleteId = signal<number | null>(null);
  isDeleting = signal(false);

  constructor(
    private router: Router,
    public uiMessageService: UiMessageService
  ) { }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe();
    this.categories = this.categoryService.categories;
  }

  editCategory(id: number) {
    this.router.navigate(['/categories', id, 'edit']);
  }

  confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;

    this.isDeleting.set(true);
    this.categoryService.deleteCategorie(id).subscribe({
      next: () => {
        this.categoryService.removeFromCategories(id);
        this.uiMessageService.setSuccess('Catégorie supprimée avec succès!');
      },
      error: (err) => {
        this.pendingDeleteId.set(null);
        this.isDeleting.set(false);
        this.uiMessageService.setError(`${err?.error?.message || "Une erreur est survenue lors de la suppression"}`);
      },
      complete: () => {
        this.pendingDeleteId.set(null);
        this.isDeleting.set(false);
      }
    });
  }
}
