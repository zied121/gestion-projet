import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgetpswdComponent } from './pages/forgetpswd/forgetpswd.component';
import { WorkspaceformComponent } from './pages/workspaceform/workspaceform.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileDetailsComponent } from './pages/profile-details/profile-details.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

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
    path: '',
    component: MainLayoutComponent,

    children: [
      {
        path: 'workspaceform',
        component: WorkspaceformComponent
      },
      {
        path: 'workspace/:id',
        component: DashboardComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'workspace/:id/profile',
        component: ProfileDetailsComponent
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./components/project-task-management/project/project.module').then(
            (m) => m.ProjectModule
          ),

      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./components/project-task-management/task/task.module').then(
            (m) => m.TaskModule
          ),
      }
      // Uncomment and adjust when ready
      // {
      //   path: 'admin/organizations',
      //   loadChildren: () =>
      //     import('./components/project-task-management/organizations/organization.module').then(
      //       m => m.OrganizationModule
      //     ),
      //   canActivate: [adminGuard]
      // },
    ]
  }
];
