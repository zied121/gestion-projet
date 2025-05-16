import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Propriétés pour les messages d'alerte
  alertMessage: string = '';
  showAlert: boolean = false;

  // Propriétés de chargement
  isLoading: boolean = false;

  // Propriétés pour le footer contextuel
  showContextFooter: boolean = false;

  // Propriétés pour le pied de page
  currentYear: number = new Date().getFullYear();
  appVersion: string = '1.0.0'; // Vous pouvez importer ceci depuis environment.ts si nécessaire

  // Méthode pour fermer l'alerte
  dismissAlert(): void {
    this.alertMessage = '';
    this.showAlert = false;
  }

  // Méthode pour remonter en haut de page
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Écouteur d'événement pour afficher/masquer le footer contextuel
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showContextFooter = window.scrollY > 200;
  }

  // Exemple de méthode pour afficher une alerte
  showAlertMessage(message: string): void {
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => this.dismissAlert(), 5000); // Disparaît après 5 secondes
  }
}