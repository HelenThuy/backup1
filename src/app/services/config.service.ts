import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {HttpClient} from '@angular/common/http';
import {Data} from '../model/data';
import {SettingService} from './setting.service';

@Injectable()
export class ConfigService {
	constructor(private httpClient: HttpClient, private cookieService: CookieService, private settingService: SettingService,
	            private globals: Globals, private resultsService: ResultsService, private localStorage: LocalStorage) {
	}

	getAllConfig() {
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/get-all-config');
	}

	setConfig() {
		this.getAllConfig().subscribe(data => {
			if (data.status === true) {
				this.localStorage.getItem('config').subscribe((store) => {
					if (store !== null) {
						if (data.results.app_version !== store.app_version) {
							if (data.results.pharmas.version !== store.pharmas.version) {
								this.httpClient.get<Data>(data.results.pharmas.url).subscribe(res => {
									console.log(res);
								});
							}

							this.settingService.changeEmitted$.subscribe(res => {
								console.log(res);
							});

							if (data.results.service_icd.version !== store.service_icd.version) {
								this.getServiceIcd(data.results.service_icd.url).subscribe(res => {
									console.log(res);
								});
							}
							this.localStorage.setItemSubscribe('config', data.results);
						}
					} else {

						console.log(store);
						this.localStorage.setItemSubscribe('config', data.results);

						this.httpClient.get<Data>(data.results.pharmas.url).subscribe(res => {
							this.localStorage.setItemSubscribe('pharmas', res.results);
						});
						this.httpClient.get<Data>(data.results.service_icd.url).subscribe(res => {
							this.localStorage.setItemSubscribe('service_icd', res.results);
						});
					}

					this.localStorage.getItem('setting').subscribe(res => {
						console.log(res);
						this.httpClient.get<Data>(data.results.service[res.company.company_code].url).subscribe(data => {
							if (data.status === true) {
								this.localStorage.setItemSubscribe(res.company.company_code, data.results);
							}
						});
					});

				});
			}
		});
	}

	getServiceIcd(url: string) {
		return this.httpClient.get<Data>(url);
	}
}
