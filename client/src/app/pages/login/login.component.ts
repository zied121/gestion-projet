import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // adjust path if needed
import { Router } from '@angular/router';

import { provideIcons } from '@ng-icons/core';
import { lucideTriangleAlert } from '@ng-icons/lucide';

import {   HlmAlertDescriptionDirective,
  HlmAlertDirective,
  HlmAlertIconDirective,
  HlmAlertTitleDirective, } from '@spartan-ng/ui-alert-helm';
import {UserService} from '../../services/user.service';


@Component({
  selector: 'app-login',
  imports: [CommonModule,
    FormsModule,
    HttpClientModule,
    HlmAlertDescriptionDirective,
    HlmAlertDirective,
    HlmAlertIconDirective,
    HlmAlertTitleDirective,

  ],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [provideIcons({ lucideTriangleAlert },
  ),

  ],

})
export class LoginComponent implements OnInit {
  email: string = '';
  motDePasse: string = '';
  showError: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private userService: UserService,) {
  }

 ngOnInit(): void {
  // Initialisation si nécessaire
}

onSubmit() {
  const payload = { email: this.email, motDePasse: this.motDePasse };

  this.authService.login(payload).subscribe({
    next: (response: any) => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      this.showError = false;
      // Appel à getProfile après une connexion réussie
      this.userService.getProfile(this.email, this.motDePasse).subscribe({
        next: (res) => {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          if (!users.some((user: any) => user.id === res.id)) {
            users.push(res);
          }
          localStorage.setItem('users', JSON.stringify(users));
        },
        error: (err) => console.error('Erreur lors de la récupération du profil utilisateur:', err),
      });

      this.router.navigate(['/workspaceform']);
    },
    error: (err) => {
      console.error('Erreur lors de la connexion:', err);
      this.showError = true;
      this.errorMessage = err.error.msg || 'Une erreur est survenue lors de la connexion.';
    },
  });
}
}



