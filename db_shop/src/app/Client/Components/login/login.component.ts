import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ClientService } from '../../Services/client.service';

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    role_id: number;
  };
}

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    FormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class UserLoginComponent {
  formData = {
    email: '',
    password: '',
  };
  isLoading = false;

  constructor(
    private clientService: ClientService, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  submit() {
    this.isLoading = true;

    const payload = {
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
    };

    if (!payload.email || !payload.password) {
      this.showError('Please fill in all fields correctly');
      this.isLoading = false;
      return;
    }

    console.log('Payload sent to server:', payload);

    this.clientService.loginUser(payload).subscribe({
        next: (response: LoginResponse) => {
          console.log('Server response:', response);
          if (response.success) {
            localStorage.setItem('userId', response.user.id.toString());
            console.log('Stored user ID:', response.user.id);
            console.log('User data:', {
              id: response.user.id,
              email: response.user.email,
              firstname: response.user.firstname,
              lastname: response.user.lastname,
              password: response.user.password,
              role_id: response.user.role_id,
            });
            this.showSuccess('Login successful!');
            this.router.navigate(['/index']);
          } else {
            this.showError(response.message || 'Login failed');
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Login error:', error);
          this.handleError(error);
        },
        complete: () => {
          this.isLoading = false;
        },
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Login failed. Please try again.';

    if (error.status === 401) {
      errorMessage = error.error?.message || 'Incorrect email or password';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Check your connection.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Try again later.';
    }

    this.showError(errorMessage);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  goTo(page: string) {
    this.router.navigate([`/${page}`]);
  }
}