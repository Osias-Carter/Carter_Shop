import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../Services/admin.service';
import { CategoryService } from '../../Services/category.service';
import { ProductService } from '../../Services/product.service';

export interface Product {
  id: number;
  pro_name: string;
  pro_desc?: string;
  pro_price: number;
  categories_id: number;
}

export interface Category {
  id: number;
  cat_name: string;
  productCount: number;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  roles_id?: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'categories';
  categories: Category[] = [];
  products: Product[] = [];
  user: User | null = null;
  categoryForm: FormGroup;
  productForm: FormGroup;
  accountForm: FormGroup;
  editingCategory: Category | null = null;
  editingProduct: Product | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminService: AdminService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      cat_name: ['', Validators.required]
    });

    this.productForm = this.fb.group({
      pro_name: ['', Validators.required],
      pro_desc: ['',Validators.required],
      pro_price: ['', [Validators.required, Validators.min(0)]],
      categories_id: ['', Validators.required]
    });

    this.accountForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.minLength(5)]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    // Load categories
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.map(category => ({
          ...category,
          productCount: category.productCount || 0
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur chargement catégories.', 'Fermer', { duration: 3000 });
        console.error(err);
        this.isLoading = false;
      }
    });

    // Load products
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.map(product => ({
          id: product.id,
          pro_name: product.pro_name || '',
          pro_desc: product.pro_desc || '',
          pro_price: product.pro_price || 0,
          categories_id: product.categories_id || 0
        }));

        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erreur chargement produits.', 'Fermer', { duration: 3000 });
        console.error(err);
        this.isLoading = false;
      }
    });

    // Load user
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.adminService.getUser(+userId).subscribe({
        next: (user) => {
          this.user = user;
          this.accountForm.patchValue({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: ''
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Erreur chargement profil.', 'Fermer', { duration: 3000 });
          console.error(err);
          this.isLoading = false;
        }
      });
    }
  }

  setActiveTab(tab: string, event: Event): void {
    event.preventDefault();
    this.activeTab = tab;
  }

  // Categories
  startEditCategory(category: Category): void {
    this.editingCategory = { ...category };
    this.categoryForm.patchValue({ cat_name: category.cat_name });
  }

  handleCategorySubmit(): void {
    if (this.categoryForm.invalid) return;
    const data = { cat_name: this.categoryForm.value.cat_name };

    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory.id, { cat_name: data.cat_name }).subscribe({
        next: (updated) => {
          const index = this.categories.findIndex(c => c.id === updated.id);
          if (index !== -1) {
            this.categories[index] = { ...updated, productCount: this.categories[index].productCount };
          }
          this.cancelEditCategory();
          this.snackBar.open('Catégorie mise à jour.', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Erreur mise à jour.', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    } else {
      this.categoryService.createCategory(data).subscribe({
        next: (newCategory) => {
          this.loadData(); // Refresh categories to include the new one
          this.categoryForm.reset();
          this.snackBar.open('Catégorie ajoutée.', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Erreur ajout.', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  confirmDeleteCategory(id: number): void {
    if (confirm('Supprimer cette catégorie ?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== id);
          this.snackBar.open('Catégorie supprimée.', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Erreur suppression.', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  cancelEditCategory(): void {
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  // Products
  startEditProduct(product: Product): void {
    this.editingProduct = { ...product };
    this.productForm.patchValue({
      pro_name: product.pro_name,
      pro_desc: product.pro_desc,
      pro_price: product.pro_price,
      categories_id: product.categories_id
    });
  }
 


  handleProductSubmit(): void {
    if (this.productForm.invalid) return;
    const data = {
      pro_name: this.productForm.value.pro_name,
      pro_desc: this.productForm.value.pro_desc,
      pro_price: +this.productForm.value.pro_price,
      categories_id: +this.productForm.value.categories_id
    };

    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, { pro_name: data.pro_name, pro_desc: data.pro_desc, pro_price: data.pro_price, categories_id: data.categories_id }).subscribe({
        next: (updated) => {
          const index = this.products.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            this.products[index] = {
              id: updated.id,
              pro_name: updated.pro_name,
              pro_desc: updated.pro_desc,
              pro_price: updated.pro_price,
              categories_id: updated.categories_id
            };
          }
          this.cancelEditProduct();
          this.snackBar.open('Produit mis à jour.', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Erreur mise à jour.', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    } else {
      this.productService.createProduct(data).subscribe({
        next: (newProd) => {
          this.loadData(); // Refresh productss to include the new one
          this.productForm.reset();
          this.snackBar.open('Produit ajoutée.', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Erreur ajout.', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  confirmDeleteProduct(id: number): void {
    if (confirm('Supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== id);
          this.snackBar.open('Produit supprimé.', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open('Erreur suppression.', 'Fermer', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  cancelEditProduct(): void {
    this.editingProduct = null;
    this.productForm.reset();
  }

  // Account
  handleAccountSubmit(): void {
    if (this.accountForm.invalid || !this.user) return;
    const data: Partial<User> = {
      firstname: this.accountForm.value.firstname,
      lastname: this.accountForm.value.lastname,
      email: this.accountForm.value.email
    };
    if (this.accountForm.value.password) {
      data.password = this.accountForm.value.password;
    }
    this.adminService.updateUser(this.user.id, data).subscribe({
      next: (updated) => {
        this.user = { ...this.user, ...updated };
        this.accountForm.patchValue({ password: '' });
        this.snackBar.open('Profil mis à jour.', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Erreur mise à jour.', 'Fermer', { duration: 3000 });
        console.error(err);
      }
    });
  }

  // Stats
  getStats(): any {
    return {
      totalCategories: this.categories.length,
      totalProducts: this.products.length,
      totalStock: this.products.reduce((sum, p) => sum + (p.pro_price || 0), 0)
    };
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.router.navigate(['/admin_login']);
    this.snackBar.open('Déconnexion réussie.', 'Fermer', { duration: 3000 });
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find(c => c.id === categoryId)?.cat_name || 'N/A';
  }
}