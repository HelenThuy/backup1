import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Globals} from '../app.globals';
import {CookieService} from 'ngx-cookie-service';
import {Inject, Injectable} from '@angular/core';
import { Router } from '@angular/router';
import {catchError, tap, map} from 'rxjs/operators';
import {AuthService} from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(private cookieService: CookieService, private globals: Globals, private router: Router, private authService: AuthService) {
	}

	intercept(req: HttpRequest<any>,
	          next: HttpHandler): Observable<HttpEvent<any>> {

		// set request header
		const authReq = req.clone({
			headers: new HttpHeaders({
				'Authorization': 'Bearer ' + this.cookieService.get('token'),
			})
		});

		return next.handle(authReq).pipe(
			map((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					if (event.body.token) {
						// set new token to cookie
						this.cookieService.set('token', event.body.token, 1, '/');
					}
				}
				return event;
			}),
			catchError((error: HttpErrorResponse) => {
				if (error.status == 401) {
					this.authService.logout();
					this.router.navigate([this.authService.loginUrl]);
				}
				return throwError(error);
			})
		);
	}
}
