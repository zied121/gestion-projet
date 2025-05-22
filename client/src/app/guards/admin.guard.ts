import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userRole:any = authService.getUserRole(); // Assume this method returns the user's role

  return   userRole === 'admin ' || userRole === 'manager';
};
