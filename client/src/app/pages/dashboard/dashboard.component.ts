import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganisationService } from '../../services/organisation.service';
import { UserService } from '../../services/user.service';
import { TeamService } from '../../services/team.service';

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
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
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

import { User } from '../../models/user/user.model';
import { Team } from '../../models/team/team.model';

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
  teamList: Team[] = [];
  analyticsData :any = {};
  newTeam: Team = { name: '', code_hex: '#000000' };
  editTeamData: Team = { _id: '', name: '', code_hex: '#000000' };
  selectedTeamIndex: number | null = null;

  listUsers: User[] = [];
  workspaceId = '';
  selectedUserIndex: number | null = null;
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  limit = 4;

  newUserData: User = {
    nom: '',
    email: '',
    role: '',
    motDePasse: '',
    teams: []
  };

  editUserData: User = {
    nom: '',
    email: '',
    role: '',
    teams: []
  };


  searchTerm: string = '';
selectedRole: string = '';
selectedStatus: string = '';

  constructor(
    private organisationService: OrganisationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.workspaceId = id;
        this.getUsersByOrganisation();
        this.getAllTeams();
        this.analyticsForUser(id);
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

  getAllTeams(): void {
    this.teamService.getAllTeams().subscribe({
      next: (res) => this.teamList = res,
      error: (err) => console.error('Error fetching teams:', err)
    });
  }

  addUser(ctx: any): void {
    this.userService.addUser(this.newUserData, this.workspaceId).subscribe({
      next: () => {
        this.getUsersByOrganisation();
        this.newUserData = { nom: '', email: '', role: '', motDePasse: '', teams: [] };
        ctx.close();
      },
      error: (err) => console.error('Error adding user:', err)
    });
  }

  editUser(index: number): void {
    const user = this.listUsers[index];
    this.selectedUserIndex = index;
    this.editUserData = {
      _id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      teams: user.teams || []
    };
  }

  saveEditUser(ctx: any): void {
    if (this.selectedUserIndex !== null) {
      const userId = this.listUsers[this.selectedUserIndex]._id;
      this.userService.updateUser(userId!, this.editUserData).subscribe({
        next: () => {
          this.getUsersByOrganisation();
          this.selectedUserIndex = null;
          ctx.close();
        },
        error: (err) => console.error('Error updating user:', err)
      });
    }
  }

  deleteUser(index: number): void {
    const userId = this.listUsers[index]._id;
    this.userService.deleteUser(userId!, this.workspaceId).subscribe({
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

  addTeam(ctx: any): void {
    this.teamService.createTeam(this.newTeam,this.workspaceId).subscribe({
      next: () => {
        this.getAllTeams();
        this.newTeam = { name: '', code_hex: '#000000' };
        ctx.close();
      },
      error: (err) => console.error('Error creating team:', err)
    });
  }

  editTeam(index: number): void {
    const team = this.teamList[index];
    this.selectedTeamIndex = index;
    this.editTeamData = { ...team };
  }

  saveEditTeam(ctx: any): void {
    if (this.selectedTeamIndex !== null) {
      const teamId = this.editTeamData._id;
      this.teamService.updateTeam(teamId!, this.editTeamData).subscribe({
        next: () => {
          this.getAllTeams();
          this.selectedTeamIndex = null;
          ctx.close();
        },
        error: (err) => console.error('Error updating team:', err)
      });
    }
  }

  deleteTeam(index: number): void {
    const teamId = this.teamList[index]._id;
    this.teamService.deleteTeam(teamId!).subscribe({
      next: () => {
        this.teamList.splice(index, 1);
      },
      error: (err) => console.error('Error deleting team:', err)
    });
  }

  getTeamNames(teamIds: string[]): string[] {
    return this.teamList.filter(team => teamIds.includes(team._id!)).map(team => team.name);
  }


  analyticsForUser(organisationid: string): void {
    this.userService.analyticsForUser(organisationid).subscribe({
      next: (res) => {
        console.log('Analytics for user:', res);
        this.analyticsData = res; 
      },
      error: (err) => console.error('Error fetching analytics:', err)
    });
  }

applyFilters(): void {
    const params: any = {
      search: this.searchTerm,
      role: this.selectedRole,
      status: this.selectedStatus,
      organisationId: this.workspaceId,
    };

    this.userService.getFilteredUsers(params).subscribe(res => {
      this.listUsers = res.Users;
      this.totalPages = res.totalPages || 1;
    });
  }

  
}
