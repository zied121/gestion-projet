import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganisationService } from '../../services/organisation.service';
import { UserService } from '../../services/user.service';

import {
  BrnDialogContentDirective,
  BrnDialogTriggerDirective,
} from '@spartan-ng/brain/dialog';
import {
  HlmDialogComponent,
  HlmDialogContentComponent,
  HlmDialogDescriptionDirective,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleDirective,
} from '@spartan-ng/ui-dialog-helm';
import {
  HlmInputDirective,
} from '@spartan-ng/ui-input-helm';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmLabelDirective } from '@spartan-ng/ui-label-helm';
import {
  BrnAlertDialogTriggerDirective,
  BrnAlertDialogContentDirective,
} from '@spartan-ng/brain/alert-dialog';
import {
  HlmAlertDialogComponent,
  HlmAlertDialogContentComponent,
  HlmAlertDialogDescriptionDirective,
  HlmAlertDialogFooterComponent,
  HlmAlertDialogHeaderComponent,
  HlmAlertDialogTitleDirective,
  HlmAlertDialogActionButtonDirective,
} from '@spartan-ng/ui-alertdialog-helm';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BrnDialogTriggerDirective,
    BrnDialogContentDirective,
    HlmDialogComponent,
    HlmDialogContentComponent,
    HlmDialogHeaderComponent,
    HlmDialogFooterComponent,
    HlmDialogTitleDirective,
    HlmDialogDescriptionDirective,
    HlmLabelDirective,
    HlmInputDirective,
    HlmButtonDirective,
    BrnAlertDialogTriggerDirective,
    BrnAlertDialogContentDirective,
    HlmAlertDialogComponent,
    HlmAlertDialogHeaderComponent,
    HlmAlertDialogFooterComponent,
    HlmAlertDialogTitleDirective,
    HlmAlertDialogDescriptionDirective,
    HlmAlertDialogActionButtonDirective,
    HlmAlertDialogContentComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  listUsers: any[] = [];
  workspaceId = '';
  selectedUserIndex: number | null = null;
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  limit = 2;

  editUserData = {
    nom: '',
    email: '',
    role: ''
  };

  newUserData = {
    nom: '',
    email: '',
    role: '',
    motDePasse: ''
  };

  constructor(
    private organisationService: OrganisationService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.workspaceId = id;
        this.getUsersByOrganisation();
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getUsersByOrganisation();
    }
  }

  getUsersByOrganisation(): void {
    this.organisationService.getAllUsersByOrganisation(this.workspaceId, this.currentPage, this.limit).subscribe({
      next: (res) => {
        this.listUsers = res.users;
        this.totalPages = res.totalPages;
        this.totalUsers = res.totalUsers;
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  editUser(index: number): void {
    const user = this.listUsers[index];
    this.selectedUserIndex = index;
    this.editUserData = { ...user };
  }

  saveEditUser(ctx: any): void {
    if (this.selectedUserIndex !== null) {
      const userId = this.listUsers[this.selectedUserIndex]._id;
      this.userService.updateUser(userId, this.editUserData).subscribe({
        next: () => {
          this.getUsersByOrganisation();
          this.selectedUserIndex = null;
          ctx.close();
        },
        error: (err) => console.error('Error updating user:', err)
      });
    }
  }

  addUser(ctx: any): void {
    this.userService.addUser(this.newUserData, this.workspaceId).subscribe({
      next: () => {
        this.getUsersByOrganisation();
        this.newUserData = { nom: '', email: '', role: '', motDePasse: '' };
        ctx.close();
      },
      error: (err) => console.error('Error adding user:', err)
    });
  }

  deleteUser(index: number): void {
    const userId = this.listUsers[index]._id;
    this.userService.deleteUser(userId, this.workspaceId).subscribe({
      next: () => this.listUsers.splice(index, 1),
      error: (err) => console.error('Error deleting user:', err)
    });
  }

  generatePassword(length: number = 12): void {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    this.newUserData.motDePasse = result;
  }
}
