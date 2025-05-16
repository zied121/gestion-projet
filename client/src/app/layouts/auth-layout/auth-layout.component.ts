import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // Importez les modules nécessaires
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent {
  // Vous pouvez ajouter des propriétés pour gérer l'état UI
  currentYear: number = new Date().getFullYear();
  
  // Méthodes utilitaires si nécessaire
  isLoginPage(): boolean {
    return window.location.pathname.includes('/login');
  }
}
