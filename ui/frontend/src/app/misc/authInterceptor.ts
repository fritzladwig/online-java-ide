import {HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService: AuthService = inject(AuthService);
    const token: string | null = authService.getToken();

    if (token) {
        const authReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token)
        });
        return next(authReq);
    }
    return next(req);
};