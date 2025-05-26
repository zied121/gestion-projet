import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberDashboardComponent } from './member-dashboard/member-dashboard.component';
import { memberGuard } from '../../../guards/member.guard';
import { authGuard } from '../../../guards/auth.guard';
import { adminGuard } from '../../../guards/admin.guard';
import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
     // canActivate: [authGuard, memberGuard]
  },{
    path: 'projects',
    component: MemberDashboardComponent,
    // canActivate: [authGuard, memberGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule {}
