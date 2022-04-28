import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {ProfileService} from '../../../services/profile.service';
import {Company} from '../../../model/company';
import {Setting} from '../../../model/setting';
import {SettingService} from '../../../services/setting.service';
import {Profile} from '../../../model/profile';
import * as moment from 'moment';
import {MessageService} from '../../../services/message.service';

@Component({
	selector: 'app-profile-info',
	templateUrl: './info.component.html',
	styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
	@Input() register: boolean = false;
	public updateProfileForm: FormGroup;
	companies: Company[] = [];
	profile: any;
	currentCompany: Company;
	public services: any;
	is_register = 0;

	constructor(private profileService: ProfileService, private router: Router, private localStorage: LocalStorage,
	            private setting: Setting, private settingService: SettingService, private messageService: MessageService) {
	}

	ngOnInit() {
		this.updateProfileForm = new FormGroup({
			user_fullname: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
            patient_id: new FormControl(null, {updateOn: 'submit'}),
			// email: new FormControl(null, {updateOn: 'submit'}),
			birthday: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
            phone_number: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			address: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			sex: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			medical_history: new FormControl(null, {updateOn: 'submit'}),
			allergy: new FormControl(null, {updateOn: 'submit'}),
		});

		this.localStorage.getItem('profile').subscribe((data) => {
			this.profile = data;
			console.log(this.profile);
			this.updateProfileForm.setValue({
				user_fullname: this.profile.user_info.user_fullname,
                patient_id: '',
                address: this.profile.user_info.address,
				// email: this.profile.user_info.email,
				birthday: new Date(this.profile.user_info.birthday * 1000),
				phone_number: this.profile.user_info.phone_number,
				sex: this.profile.user_info.sex,
				medical_history: this.profile.user_info.medical_history,
				allergy: this.profile.user_info.allergy,
			});

			if (this.profile.user_info.user_fullname == '') {
				this.is_register = 1;
			}
		});
	}

	addProfile() {
		const dataProfile = this.updateProfileForm.value;
		if (this.updateProfileForm.valid) {
			dataProfile.birthday = moment(dataProfile.birthday).unix();
			dataProfile.is_register = this.is_register;
            if(!dataProfile.patient_id) {
                dataProfile.patient_id = 0;
            }
			console.log(dataProfile);
			this.profileService.updateUserProfile(dataProfile, encodeURIComponent(this.profile.user_info.user_name)).subscribe(data => {
			    console.log(data);
				if (data.status === true) {
					// set new user info to localstorage
					this.profile.user_info.user_fullname = dataProfile.user_fullname;
					this.profile.user_info.patient_id = dataProfile.patient_id;
					this.profile.user_info.address = dataProfile.address;

					this.profile.user_info.birthday = dataProfile.birthday;
					this.profile.user_info.phone_number = dataProfile.phone_number;
					this.profile.user_info.sex = dataProfile.sex;
					this.profile.user_info.medical_history = dataProfile.medical_history;
					this.profile.user_info.allergy = dataProfile.allergy;
					// set
					this.localStorage.setItemSubscribe('profile', this.profile);

					if (this.register) {
						this.router.navigate(['/session/settings']);
					} else {
						this.messageService.open('Cập nhật thông tin thành công', 'X', 'success');
					}

				} else {
					this.messageService.open('Có lỗi trong quá trình cập nhật', 'X', 'error');
				}
			});
		}
	}

}
