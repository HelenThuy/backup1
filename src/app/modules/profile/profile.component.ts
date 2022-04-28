import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Globals} from '../../app.globals';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CustomEncoder} from '../../model/custom-encoder';
import {Data} from '../../model/data';
import {ProfileService} from '../../services/profile.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Company} from '../../model/company';
import * as moment from 'moment';
import {Profile} from '../../model/profile';
import {SettingService} from '../../services/setting.service';
import {MessageService} from '../../services/message.service';
import {CookieService} from 'ngx-cookie-service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
	user_name: any;
	user: any;
	currentProfile: any;
	show_list = true;
	show_form = false;
	profile: any = null;
	editProfileFom: FormGroup;
	companies: Company[] = [];
	userInfo: any;
	_id: string;

	constructor(private router: Router, private httpClient: HttpClient, private globals: Globals,
	            private localStorage: LocalStorage, private customEncoder: CustomEncoder, private cookieService: CookieService,
	            private profileService: ProfileService, private messageService: MessageService) {
	}

	ngOnInit() {
		this.editProfileFom = new FormGroup({
			hospital: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			patient: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			patientID: new FormControl(null, {updateOn: 'submit'}),
			birthday: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			phoneNumber: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			gender: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			address: new FormControl(null, {updateOn: 'submit'}),
			medicalHistory: new FormControl(null, {updateOn: 'submit'}),
			allergy: new FormControl(null, {updateOn: 'submit'}),
		});

		this.localStorage.getItem('profile').subscribe((data) => {
			this.companies = data.companies;
			this.userInfo = data.user_info;
			this.user_name = data.user_info.user_name;
			this.user = this.user_name;
			const company_id = this.cookieService.get('company_id');

			// API get profile
			this.profileService.getProfile(this.user,company_id).subscribe(profile => {
					if (profile.status === true) {
						this.currentProfile = profile.results;
					} else {
					}
				}
			);
		});
	}

	goEdit(e) {
		this.router.navigate(['/profile/edit-profile', e._id]);
		return;
		this.show_form = true;
		this.show_list = false;
		this.profile = e;
		const data = {
			patient: e.patient_fullname,
			hospital: {
				company_id: e.company_id,
				company_name: e.company_id,
				company_code: e.company_id,
			},
			patientID: e.patient_id,
			birthday: new Date(e.birthday * 1000),
			phoneNumber: e.phone_number,
			gender: e.sex,
			address: e.address,
			medicalHistory: e.medical_history,
			allergy: e.allergy,
		};

		this._id = e._id;
		this.editProfileFom.setValue(data);
	}

	cancel() {
		this.show_form = false;
		this.show_list = true;
	}

	editProfile() {
		const dataProfile = this.editProfileFom.value;
		const DoB = moment(new Date(dataProfile.birthday)).unix();
		const profile = {
			user_name: this.userInfo.user_name,
			birthday: DoB,
			sex: Number(dataProfile.gender),
			patient_fullname: dataProfile.patient,
			phone_number: dataProfile.phoneNumber,
			address: dataProfile.address,
			company_id: dataProfile.hospital.company_id,
			company_code: dataProfile.hospital.company_code,
			company_name: dataProfile.hospital.company_name,
			patient_id: Number(dataProfile.patientID),
			medical_history: dataProfile.medicalHistory,
			allergy: dataProfile.allergy,
			access_token: 'zzz'
		} as Profile;

		this.profileService.updateProfile(profile, this._id).subscribe(data => {
			if (data.status === true) {
				this.messageService.open('Cập nhật hồ sơ thành công', 'X', 'success');
			} else {
				this.messageService.open('Cập nhật hồ sơ không thành công', 'X', 'error');
			}
		});
	}

	compareObjects(o1: any, o2: any): boolean {
		return o1.company_id === o2.company_id;
	}
}
