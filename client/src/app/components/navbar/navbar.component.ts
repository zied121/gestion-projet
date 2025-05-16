import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrganisationService } from '../../services/organisation.service';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  workspaceId = '';
  organisationData: any;
  userData: any;
  constructor(
    private organisationService: OrganisationService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  showDropdown = false;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
    
      this.getConnectedUser();
    });
  }


  getOrganisationById(id: string): void {
    this.organisationService.getOrganisationById(id).subscribe({
      next: (org) => this.organisationData = org,
      error: (err) => console.error('Error fetching organisation:', err)
    });
  }
  getConnectedUser(): void {
    this.userService.getProfile().subscribe({
      next: (res) => this.userData = res.user,
      
      error: (err) => console.error('Error fetching user:', err)
    });
  }
}
