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
import {AdminApplicationDashboardComponent} from './pages/admin-application-dashboard/admin-application-dashboard.component';
import { ownerGuard } from './guards/owner.guard';
import {BlogModule} from './components/blog/blog.module';
import { memberGuard } from './guards/member.guard';
import {FrontofficelayoutComponent} from './layouts/Front-office-layout/Front-office-layout.component';
{ownerGuard}
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
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
    component: SuccessPaiementComponent,
  },
  {
    path: 'cancel',
    component: FailPaiementComponent,
  },
  {
    path: 'workspaceform',
    component: WorkspaceformComponent,
    canActivate: [authGuard]
  },

  // Protected routes with navbar via MainLayoutComponent
  {
    path: '',
    component: MainLayoutComponent,

    children: [
      {
        path: 'workspace/:id',
        component: DashboardComponent,
        canActivate: [adminGuard]
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
      },
      {
        path: 'backoffice',
        component: AdminApplicationDashboardComponent,
        canActivate: [ownerGuard]
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./components/project-task-management/project/project.module').then(
            (m) => m.ProjectModule
          ),
        canActivate: [adminGuard]

      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./components/project-task-management/task/task.module').then(
            (m) => m.TaskModule
          ),
        canActivate: [adminGuard]
      },

    ]
  },


  {
    path: '',
    component: FrontofficelayoutComponent,

    children: [
      {
        path: 'member',
        loadChildren: () =>
          import('./components/project-task-management/member/member.module').then(
            (m) => m.MemberModule),
        canActivate: [memberGuard]
      },


      {
        path: 'blogs',
        loadChildren: () =>
          import('./components/blog/blog.module').then(
            (m) => m.BlogModule),
      },
    ]
  }
  ]
