import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {Globals} from '../app.globals';
import {AuthService} from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {
	constructor(private authService: AuthService, private router: Router,
	            private cookieService: CookieService, private globals: Globals) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return this.checkLogin(state.url);
	}

	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return this.canActivate(route, state);
	}

	checkLogin(url: string): boolean {
		if (this.authService.isLoggedIn()) {
			return true;
		}
		this.authService.redirectUrl = url;

		// Store the attempted URL for redirecting
		this.router.navigate([this.authService.loginUrl]);
		return false;
	}

}
