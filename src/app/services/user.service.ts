import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class UserService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

	register(user: any) {
		return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/register', this.resultsService.toResults(user));
	}

	registerByFirebase(user: any) {
		return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/login-by-firebase-auth', this.resultsService.toResults(user));
	}

	getCountryCodes() {
		return this.httpClient.get<Data>('assets/data/country-codes.json');
	}

	getUsers(par: any) {
		let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('role_id', (par.role_id) ? par.role_id : -1);
        params = params.append('username', (par.username) ? par.username : '');
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/users', {params});
	}

	updateUser(id: any, user: any) {
		if (id) {
			return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/user/' + id, user);
		} else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/user', user);
        }
	}

	changePass(data) {
        return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/change-password', data);
    }

	checkUser(user_name: any) {
		let params = new HttpParams({encoder: this.customEncoder});
		params = params.append('user_name', user_name ? user_name : '');
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/users', {params});
	}

	reIndex() {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/admin/re-index-user', {});
    }

	deleteUser(user: any) {
		if (user._id) {
			return this.httpClient.delete<Data>(this.globals.API_DOMAIN + '/admin/users/' + user._id);
		}
	}
}
