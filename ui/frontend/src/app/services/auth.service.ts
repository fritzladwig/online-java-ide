import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {catchError, map, Observable} from "rxjs";
import {AuthRequest} from "../models/authRequest";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url: string = environment.AUTH_URL;

  constructor(private http: HttpClient,
              private router: Router) { }

  getAuthenticationStatus(): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/authenticated`).pipe(
        map(response => response),
        catchError(error => {
          throw error;
        })
    );
  }

  register(authRequest: AuthRequest): Observable<string> {
    return this.http.post(`${this.url}/register`, authRequest, { responseType: "text" });
  }

  login(authRequest: AuthRequest): Observable<{[key: string]: string}> {
    const params = new HttpParams()
        .set('username', authRequest.username)
        .set('password', authRequest.password);

    return this.http.post<{[key: string]: string}>(
        `${this.url}/login`,
        params.toString(), { headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded') }
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigateByUrl("/login");
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
