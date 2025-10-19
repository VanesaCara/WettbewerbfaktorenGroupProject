import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent {
  user = { firstname: '', lastname: '', email: '', password: '' };
  errorMessage: string = ''; // Variable für die Fehlermeldung
  loading: boolean = false; // Variable für Ladezustand

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    this.errorMessage = ''; // Setze Fehlernachricht zurück
    this.loading = true; // Ladezustand aktivieren

    // Anfrage an den Server, um den Benutzer zu registrieren
    this.http.post('http://localhost:8080/api/users/register', this.user).subscribe(
      (response) => {
        console.log('User registered successfully!', response);
        this.router.navigate(['/login']); // Umleitung nach erfolgreicher Registrierung
        this.loading = false; // Ladezustand deaktivieren
      },
      (error) => {
        // Fehlerbehandlung, je nach Fehlerstatus und Fehlermeldung
        this.loading = false; // Ladezustand deaktivieren
        if (error.status === 400 && error.error?.message === 'Email already exists') {
          this.errorMessage = 'This email is already registered.'; // Spezifische Fehlermeldung für existierende E-Mail
        } else {
          this.errorMessage = 'An error occurred during registration. Please try again later.'; // Allgemeine Fehlermeldung
        }
        console.error('There was an error during registration', error);
      }
    );
  }
}
