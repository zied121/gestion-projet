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
    RouterModule
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
    this.userData = JSON.parse(localStorage.getItem('users') || '[]').map((user: any) => user.user)[0];
  }
}
