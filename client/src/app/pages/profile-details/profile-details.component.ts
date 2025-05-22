import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-details',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.css'
})
export class ProfileDetailsComponent implements OnInit {
  userData: any = {
    nom: '',
    prenom: '',
    email: '',
    dateDeNaissance: '',
    image: ''
  };

  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getUserDetails();

  }

  getUserDetails(): void {
    this.userService.getProfile().subscribe({
      next: (res) => {
        this.userData = {
          nom: res.user.nom || '',
          prenom: res.user.prenom || '',
          email: res.user.email || '',
          dateDeNaissance: res.user.dateDeNaissance || '', // ISO format: 'yyyy-MM-dd'
          image: res.user.image || ''
        };
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
      }
    });
  }

  selectedFile: File | null = null;

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    this.selectedFile = input.files[0];
  }
}

saveProfile(): void {
  const userId = this.route.snapshot.paramMap.get('id');

  if (!userId) {
    console.error('User ID not found in route parameters.');
    return;
  }

  const formData = new FormData();
  formData.append('nom', this.userData.nom);
  formData.append('prenom', this.userData.prenom);
  formData.append('email', this.userData.email);
  formData.append('dateDeNaissance', this.userData.dateDeNaissance);

  if (this.selectedFile) {
    formData.append('image', this.selectedFile); // Image is optional
  }

  this.userService.updateUser(userId, formData).subscribe({
    next: (res) => {
      console.log('Profile updated successfully:', res);
    },
    error: (err) => {
      console.error('Error updating profile:', err);
    }
  });
}
}
