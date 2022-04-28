import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import * as moment from 'moment';
import {User} from '../model/user';
import {Globals} from '../app.globals';
import {Data} from '../model/data';
import {ResultsService} from './results.service';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {ConfigService} from './config.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {MessageService} from './message.service';
import {SettingService} from './setting.service';

@Injectable()
export class AuthService {
	redirectUrl = '/';
	redirectToSettings = '/session/settings';
	redirectToProfile = '/session/profile';
	loginUrl = '/session/signin';

	constructor(private httpClient: HttpClient, private cookieService: CookieService, private settingService: SettingService,
	            private globals: Globals, private resultsService: ResultsService, private localStorage: LocalStorage,
	            private configService: ConfigService, private messageService: MessageService) {
	}

	login(user: any) {
		return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/login', user).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse)
	{
		return "1";
	}

	public setSession(authResult) {
		const expiresAt = authResult.results.exp;

		this.cookieService.set('token', authResult.token, 1, '/');
		this.cookieService.set('app_version', authResult.app_version, 1, '/');
		this.cookieService.set('expires_at', expiresAt.toString(), 1, '/');

		this.localStorage.setItemSubscribe('profile', authResult.results);

		// setup setting
		let setting = {
		    role: {
		        role_id: '',
		        role_code: '',
		        role_name: '',
            },
            branch: '',
        };

		if (authResult.results.role) {
		    setting.role = authResult.results.role;
        }

		if (authResult.results.branch) {
		    setting.branch = authResult.results.branch;
        }

		this.localStorage.setItemSubscribe('setting', setting);
        this.cookieService.set('role_id', setting.role.role_id, 1, '/');
        this.cookieService.set('role_code', setting.role.role_code, 1, '/');

		return;
	}

	logout() {
		this.cookieService.delete('token', '/');
		this.cookieService.delete('app_version', '/');
		this.cookieService.delete('expires_at', '/');
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/logout', {});
	}

	public isLoggedIn() {
		return moment().unix() < this.getExpiration();
	}

	isLoggedOut() {
		return !this.isLoggedIn();
	}

	getExpiration() {
		return Number(this.cookieService.get('expires_at'));
	}
}

