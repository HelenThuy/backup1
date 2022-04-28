import {Component, Output, EventEmitter, OnInit} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';
import {Company} from '../../model/company';
import {Role} from '../../model/role';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Setting} from '../../model/setting';
import {Config} from '../../model/config';
import {Data} from '../../model/data';
import {HttpClient} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {SettingService} from '../../services/setting.service';


@Component({
	selector: 'app-options',
	templateUrl: './options.component.html'
})
export class OptionsComponent implements OnInit {

	currentLang = 'en';
	showSettings = false;
	options = {
		collapsed: false,
		compact: false,
		boxed: false,
		dark: false,
		dir: 'ltr'
	};
	setting: Setting = {} as Setting;
	companies: Company[] = [];
	currentCompany: Company;
	currentRole: any;
	roles: any;
	config: Config;

	settingForm: FormGroup;

	@Output() messageEvent = new EventEmitter();
	@Output() settingEvent = new EventEmitter();

	constructor(private cookieService: CookieService, private router: Router, private settingService: SettingService,
	            public translate: TranslateService, private localStorage: LocalStorage, private httpClient: HttpClient) {
		const browserLang: string = translate.getBrowserLang();
		translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
	}

	ngOnInit() {
	    //
		// this.settingForm = new FormGroup({
		// 	company: new FormControl('', {updateOn: 'submit'}),
		// 	role: new FormControl('', {updateOn: 'submit'}),
		// });
        //
		// this.localStorage.getItem<Config>('config').subscribe(config => {
		// 	this.config = config;
		// });
        //
		// this.localStorage.getItem('profile').subscribe(profile => {
		// 	this.companies = profile.user_info_at_company;
		// 	this.roles = profile.roles;
        //
		// 	this.localStorage.getItem('setting').subscribe(data => {
		// 		if (data !== null) {
		// 			this.setting.company = data.company;
		// 			this.settingForm.setValue({
		// 				company: data.company,
		// 				role: data.role
		// 			});
        //
		// 			this.settingEvent.emit(this.setting);
		// 		}
        //
		// 		this.companies.forEach((item) => {
		// 			if (item.company_id == data.company.company_id && item.roles) {
		// 				this.roles = item.roles;
		// 			}
		// 		});
		// 	});
		// });

	}

	changeHospital(event) {
		this.roles = event.value.roles;
	}

	sendSetting() {
		this.setting.company = this.settingForm.value.company;
		this.setting.role = this.settingForm.value.role;

		this.cookieService.set('role_id', this.setting.role.role_id, 1, '/');
		this.cookieService.set('role_code', this.setting.role.role_code, 1, '/');
		this.cookieService.set('company_id', this.setting.company.company_id.toString(), 1, '/');
		this.cookieService.set('company_code', this.setting.company.company_code, 1, '/');

		this.localStorage.setItemSubscribe('setting', this.setting);

		// Todo: lấy dữ liệu dịch vụ theo từng chi nhánh
		if (this.config !== undefined && this.config !== null) {
			this.localStorage.getItem(this.setting.company.company_code).subscribe(res => {
				if (res === null) {
					this.httpClient.get<Data>(this.config.service[this.setting.company.company_code].url).subscribe(data => {
						if (data.status === true) {
							this.localStorage.setItemSubscribe(this.setting.company.company_code, data.results);
						}
					});
				}
			});
		}

		const params = {
			company_id: this.setting.company.company_id,
			company_name: this.setting.company.company_name,
			company_code: this.setting.company.company_code,
			role_id: this.setting.role.role_id,
			role_code: this.setting.role.role_code,
			role_name: this.setting.role.role_name,
		};

		this.settingService.setCurrentConfig(params).subscribe(data => {
			this.showSettings = false;
			this.settingEvent.emit(this.setting);
			this.router.navigate(['/']);
		});


	}

	compareObjects(o1: any, o2: any): boolean {
		return o1.company_id === o2.company_id;
	}

	compareRole(o1: any, o2: any): boolean {
		return o1.role_id === o2.role_id;
	}
}
