import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Setting} from '../model/setting';
import {Data} from '../model/data';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class SettingService {
	setting: Setting;

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService, private customEncoder: CustomEncoder) {

	}

	/**
	 * Todo: cơ chế thay đổi options không cần refresh
	 * */
	private emitChangeSource = new Subject<Setting>();
	changeEmitted$ = this.emitChangeSource.asObservable();

	emitChange(setting: Setting) {
		this.setting = setting;
		this.emitChangeSource.next(setting);
	}

	setCurrentConfig(config) {
		return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/company/current', this.resultsService.toResults(config));
	}

	getCountNoti(params) {
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/company/count', {params});
	}

	getListNoti(p = '1', n = '15') {
		let params = new HttpParams({encoder: this.customEncoder});
		params = params.append('n', n);
		params = params.append('p', p);
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/company/notifications', {params});
	}

	readNoti(id, params) {
		return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/company/notifications/' + id, this.resultsService.toResults({params}));
	}
}
