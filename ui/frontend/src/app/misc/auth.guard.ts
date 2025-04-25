import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from "../services/auth.service";
import {catchError, map, of} from "rxjs";
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getAuthenticationStatus().pipe(
        map(isAuthenticated => {
            if (isAuthenticated) {
                return true;
            } else {
                localStorage.removeItem("access_token");
                return router.createUrlTree(['/login']);
            }
        }),
        catchError((error) => {
            console.error(error);
            localStorage.removeItem("access_token");
            return of(router.createUrlTree(['/login']));
        })
    );
};