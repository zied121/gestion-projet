// auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  } else {
    const router = inject(Router); // ✅ Use inject() instead of new Router()
    router.navigate(['/login'], );
    return false;
  }
};
