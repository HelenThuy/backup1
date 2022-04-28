import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {Profile} from '../model/profile';
import {Data} from '../model/data';
import {ResultsService} from './results.service';
import {CustomEncoder} from '../model/custom-encoder';
import {Subject} from 'rxjs';
import {LoginProfile} from '../model/login-profile';

@Injectable()
export class ProfileService {
	redirectUrl = '/profile';
	profile: LoginProfile;

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

	// API Add profile
	addProfile(profile: Profile) {
		return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/reception/profile', this.resultsService.toResults(profile));
	}

	// API get profile
	getProfile(username, company_id) {
		let params = new HttpParams({encoder: this.customEncoder});
		params = params.append('user_name', username);
		params = params.append('company_id', company_id);
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/reception/profile', {params});
	}

	getProfileById(id) {
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/reception/profile/'+id);
	}

	// API update profile
	updateProfile(profile: Profile, id) {
		return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/reception/profile/' + id, this.resultsService.toResults(profile));
	}

	updateUserProfile(object, user_name) {
		return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/account/users/' + user_name, this.resultsService.toResults(object));
	}

	checkPatientId(id) {
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/company/profile/'+id);
	}

	getMemberCard() {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/patient/get-member-info');
    }

	/**
	 * Todo: cơ chế thay đổi options không cần refresh
	 * */
	private emitChangeSource = new Subject<LoginProfile>();
	changeEmitted$ = this.emitChangeSource.asObservable();

	emitChange(profile: LoginProfile) {
		this.profile = profile;
		this.emitChangeSource.next(profile);
	}
}
