import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {ProfileService} from '../../../services/profile.service';
import {Company} from '../../../model/company';
import {Setting} from '../../../model/setting';
import {SettingService} from '../../../services/setting.service';
import {Profile} from '../../../model/profile';
import * as moment from 'moment';
import {MessageService} from '../../../services/message.service';
import * as firebase from 'firebase';
import {ConfigService} from '../../../services/config.service';
import {WindowService} from '../../../services/window.service';
import {Globals} from '../../../app.globals';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material';
import {APP_DATE_FORMATS, AppDateAdapter} from '../../../services/elements/my.date.adapter';
import {UiSpinnerService} from '../../../services/ui/ui-spinner-service';

@Component({
	selector: 'app-add-profile',
	templateUrl: './add-profile.component.html',
	styleUrls: ['./add-profile.component.scss'],
	providers: [
		{provide: DateAdapter, useClass: AppDateAdapter},
		{provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
	]
})
export class AddProfileComponent implements OnInit {
	addProfileFom: FormGroup;
	companies: Company[] = [];
	userInfo: any;
	currentCompany: Company;
	services: any;
	_id: string = '';
	windowRef: any;
	formVerify: FormGroup;
	form: FormGroup;
	stateFormVerification = false;
	recaptchaVerifier: firebase.auth.RecaptchaVerifier;
	tmpData: any;
	changePatientID = false;
	reToken: string = '';
	captchaError: string = '';
	smsNum: string;

	constructor(private profileService: ProfileService, private router: Router, private localStorage: LocalStorage, private route: ActivatedRoute,
	            private setting: Setting, private settingService: SettingService, private messageService: MessageService,
	            private fb: FormBuilder, private win: WindowService, private globals: Globals, private uiSpinnerService: UiSpinnerService) {
	}

	ngOnInit() {
		this.addProfileFom = new FormGroup({
			hospital: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			patient: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			patientID: new FormControl(null, {updateOn: 'submit'}),
			birthday: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			phoneNumber: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			gender: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			reCaptcha: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			address: new FormControl(null, {updateOn: 'submit'}),
			medicalHistory: new FormControl(null, {updateOn: 'submit'}),
			allergy: new FormControl(null, {updateOn: 'submit'}),
		});

		if (this.route.snapshot.params['id']) {
			this.profileService.getProfileById(this.route.snapshot.params['id']).subscribe(data => {
				if (data.status == true) {
					const form = {
						patient: data.results.patient_fullname,
						hospital: {
							company_id: data.results.company_id,
							company_name: data.results.company_name,
							company_code: data.results.company_code,
						},
						patientID: data.results.patient_id,
						birthday: new Date(data.results.birthday * 1000),
						phoneNumber: data.results.phone_number,
						gender: data.results.sex,
						address: data.results.address,
						medicalHistory: data.results.medical_history,
						allergy: data.results.allergy,
						reCaptcha: null
					};
					this.tmpData = Object.assign({}, form);

					this._id = data.results._id;

					this.addProfileFom.setValue(form);
				} else {
					this.router.navigate(['/profile']);
				}

			});
		}

		this.localStorage.getItem('profile').subscribe((data) => {
			this.companies = data.companies;
			this.userInfo = data.user_info;

            // Get companies data form profile
            this.localStorage.getItem('setting').subscribe((data) => {
                let fd = this.addProfileFom.value;
                fd.hospital = data.company;

                this.addProfileFom.setValue(fd);
            });
		});

		this.settingService.changeEmitted$.subscribe(data => {
			this.setting = data;
			this.localStorage.getItem(this.setting.company.company_code).subscribe(res => {
				if (res !== null) {
					this.currentCompany = data.company;
					const companySelect = this.companies.find(item => item.company_id === this.currentCompany.company_id);
					this.addProfileFom.get('hospital').setValue(companySelect);
				}
			});
		});

		this.formVerify = this.fb.group({
			verificationCode: [null, Validators.compose([Validators.required])]
		});

		if (!firebase.apps.length) {
			firebase.initializeApp(this.globals.FIREBASE_CONFIG);
		}

		// Todo render captcha
		this.windowRef = this.win.windowRef;
		let that = this;
		setTimeout(() => {
			this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
				'callback': function(response) {
					that.reToken = response;
				}
			});
			this.windowRef.recaptchaVerifier.render();
		}, 500);

	}

	addProfile() {
		if (this.changePatientID) {
			this.verifyLoginCode().then(response => {
				this.saveProfile(response.toString());
			});
		} else {
			this.saveProfile('');
		}
	}

	saveProfile(token) {
		const dataProfile = this.addProfileFom.value;
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
			access_token: token
		} as Profile;

		if (this._id) {
			// call service update
			this.profileService.updateProfile(profile, this._id).subscribe(data => {
				if (data.status === true) {
					this.messageService.open('Cập nhật hồ sơ thành công', 'X', 'success');
					this.router.navigate([this.profileService.redirectUrl]);
				} else {
					this.messageService.open('Cập nhật hồ sơ không thành công', 'X', 'error');
				}

			});
		} else {
			this.profileService.addProfile(profile).subscribe(data => {
				if (data.status === true) {
					this.messageService.open('Thêm mới hồ sơ thành công', 'X', 'success');
					this.router.navigate([this.profileService.redirectUrl]);
				} else {
					this.messageService.open('Thêm mới hồ sơ không thành công', 'X', 'error');
				}
			});
		}
	}

	compareObjects(o1: any, o2: any): boolean {
		return (o2.company_id && o1.company_id === o2.company_id);
	}

	changeHospital(event) {
		const selectCompany = event.value;
		this.localStorage.getItem(selectCompany.company_code).subscribe(res => {
			if (res !== null) {
				this.services = res.services;
			}
		});
	}

	sendLoginCode() {
		this.captchaError = '';
		if (this.reToken != '') {
		    this.uiSpinnerService.spin$.next(true);
			/**
			 * - Truong hop them moi ho so, khong co ma y te -> lưu luon ho so
			 * - Truong hop sua ho so, nhưng ma y te null  -> lưu luon ho so
			 */
			if (!this.addProfileFom.value.patientID || this.addProfileFom.value.patientID == 0) {
				this.addProfile();
                this.uiSpinnerService.spin$.next(false);
				return true;
			}

			this.profileService.checkPatientId(this.addProfileFom.value.patientID).subscribe(data => {
				if (data.status) {
					/**
					 * Tien hanh kiem tra ma y te, gửi sms trong cac truong hop sau:
					 * - tao moi ho so
					 * - thay doi thong tin ma y te
					 * - trang thai send_sms = true dc tra ve (truong hop sdt dang ma y te da thay doi)
					 */
					if ((this._id == '' && this.addProfileFom.value.patientID)
						|| (this.tmpData && this.tmpData.patientID != this.addProfileFom.value.patientID)
						|| (data.results.send_sms && data.results.send_sms === true)
					) {
						this.changePatientID = true;
						const appVerifier = this.windowRef.recaptchaVerifier;
						let num = data.results.phone_number_at_company;
						if (!this.checkPhoneNumner(num)) {
							num = '+84' + num;
						}

						firebase.auth().signInWithPhoneNumber(num, appVerifier)
							.then(result => {
								this.smsNum = num;
								this.windowRef.confirmationResult = result;
								this.stateFormVerification = true;
							})
							.catch(error => {
								this.messageService.open('Có lỗi khi xác thực số điện thoại đăng ký mã y tế!', 'X', 'error');
							});
					} else {
						this.addProfile();
					}
				} else {
					this.messageService.open('Mã y tế không hợp lệ', 'X', 'error');
				}
                this.uiSpinnerService.spin$.next(false);
			});

		} else {
			this.captchaError = 'Vui lòng chọn Tôi không phải người máy!';
		}
	}

	verifyLoginCode() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				this.windowRef.confirmationResult
					.confirm(this.formVerify.controls.verificationCode.value)
					.then(result => {
						firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
							resolve(idToken);
						}).catch(function (error) {
							reject('error');
						});
					})
					.catch(error => console.log(error, 'Incorrect code entered?'));

			}, 200);
		});
	}


	resolved(captchaResponse: string, res = null) {
		console.log(`Resolved response token: ${captchaResponse}`);

	}

	checkPhoneNumner(num) {
		var phoneRe = /^[+][0-9]*$/g;
		return phoneRe.test(num);
	}
}
