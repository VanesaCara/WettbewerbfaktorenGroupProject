import { Component } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {NgIf} from '@angular/common';
import {catchError, of} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    HttpClientModule,
    NgIf,
    // Ensure HttpClientModule is imported
  ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {
  }

  login(): void {
    const loginDTO = {
      email: this.email,
      password: this.password,
    };

    this.http
      .post('http://localhost:8080/api/users/login', loginDTO)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Invalid email or password';
          return of(error); // Handle error gracefully
        })
      )
      .subscribe((response: any) => {
        if (response) {
          // Store relevant user information in localStorage
          const userInfo = {
            id: response.id,
            firstname: response.firstname,
            lastname: response.lastname,
            email: response.email
          };
          localStorage.setItem('user', JSON.stringify(userInfo)); // Save user info to localStorage
          this.router.navigate(['/dashboard']); // Redirect to the dashboard or another page
        }
      });
  }
}
