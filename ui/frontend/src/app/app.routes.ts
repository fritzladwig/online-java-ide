import { Routes } from '@angular/router';
import {MainPageComponent} from "./components/main-page/main-page.component";
import {LoginPageComponent} from "./components/login-page/login-page.component";
import {authGuard} from "./misc/auth.guard";
import {AuthCallbackComponent} from "./components/auth-callback/auth-callback.component";

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'callback', component: AuthCallbackComponent },
  { path: '', component: MainPageComponent, canActivate: [authGuard]},
  { path: '**', redirectTo:'', pathMatch: 'full' }
];
