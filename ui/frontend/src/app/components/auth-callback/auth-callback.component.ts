import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-auth-callback',
    imports: [],
    templateUrl: './auth-callback.component.html',
    styleUrl: './auth-callback.component.scss'
})
export class AuthCallbackComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.handleAuthenticationFragment();
  }

  private handleAuthenticationFragment(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');

        if (accessToken) {
          localStorage.setItem('access_token', accessToken);

          this.router.navigate(['/'], {
            relativeTo: this.route,
            replaceUrl: true,
            fragment: undefined
          });

        } else if (params.get('error')) {
          console.error(params.get('error'));
          this.router.navigate(['/login'], {
            relativeTo: this.route,
            replaceUrl: true,
            fragment: undefined
          });
        }
      }
    });
  }

}
