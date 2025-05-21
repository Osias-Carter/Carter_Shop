import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  role_id: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;

}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // 🔐 Login
  loginUser(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  // 📝 Register
  registerUser(userData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    roles_id?: number;
  }): Observable<any> {
    const payload = { ...userData, roles_id: userData.roles_id = 2 };
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  // Get user info
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  // Update user info
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData);
  }
}