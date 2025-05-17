import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgetpswdComponent } from './pages/forgetpswd/forgetpswd.component';
import { WorkspaceformComponent } from './pages/workspaceform/workspaceform.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
import { OrganisationProfileComponent } from './pages/organisation-profile/organisation-profile.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';

import { SuccessPaiementComponent } from './components/success-paiement/success-paiement.component';
import { FailPaiementComponent } from './components/fail-paiement/fail-paiement.component';
import {CalendarComponent} from './pages/calendar/calendar.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // Auth routes without navbar
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'forgetpswd',
    component: ForgetpswdComponent
  },
  {
    path: 'success',
    component: SuccessPaiementComponent
  },
  {
    path: 'cancel',
    component: FailPaiementComponent
  },


  // Protected routes with navbar via MainLayoutComponent
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'workspaceform',
        component: WorkspaceformComponent
      },
      {
        path: 'workspace/:id',
        component: DashboardComponent,
        canActivate: [authGuard,adminGuard]
      },
      {
        path: 'profile/:id',
        component: ProfileDetailsComponent
      },
      {
        path:'workspace/:id/profile',
        canActivate: [adminGuard],
        component: OrganisationProfileComponent
      },
      {
        path: 'subscription',
        component: SubscriptionComponent
      }
    ]
  },
 
  {
    path: 'calendar',
    component: CalendarComponent,
  }
];
