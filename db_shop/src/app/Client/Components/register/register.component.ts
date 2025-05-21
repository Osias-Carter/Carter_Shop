import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ClientService } from '../../Services/client.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class UserRegisterComponent {
  formData = {
    firstname: '',
    lastname: '',
    email: '',
    password: ''
  };
  isLoading = false;

  constructor(
    private clientService: ClientService, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get isFormValid(): boolean {
    return (
      this.formData.firstname.trim().length > 0 &&
      this.formData.lastname.trim().length > 0 &&
      this.formData.email.trim().length > 0 &&
      this.formData.password.length >= 5
    );
  }

  submit() {
    if (!this.isFormValid) {
      this.showError('Veuillez remplir tous les champs correctement');
      return;
    }

    this.isLoading = true;

    const payload = {
      firstname: this.formData.firstname.trim(),
      lastname: this.formData.lastname.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password
    };

    // Validation supplémentaire pour s'assurer que les champs ne sont pas vides après trim()
    if (!payload.firstname || !payload.lastname || !payload.email || !payload.password) {
      this.showError('Un ou plusieurs champs sont vides après suppression des espaces');
      this.isLoading = false;
      return;
    }

    console.log('Payload envoyé au serveur:', payload);

    this.clientService.registerUser(payload).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        this.showSuccess('Inscription réussie !');
        this.goTo('admin_login'); // Rediriger vers la page de connexion après l'inscription
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur lors de l\'inscription:', error);
        this.handleError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Échec de l\'inscription. Veuillez réessayer.';
    
    if (error.status === 400) {
      errorMessage = error.error?.message || 'Données du formulaire invalides';
    } else if (error.status === 409) {
      errorMessage = 'Cet email est déjà enregistré';
    } else if (error.status === 0) {
      errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    this.showError(errorMessage);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  goTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}