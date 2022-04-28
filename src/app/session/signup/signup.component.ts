import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {CustomValidators} from 'ng2-validation';
import {Globals} from '../../app.globals';
import {UserService} from '../../services/user.service';
import {AuthService} from '../../services/auth.service';
import {User} from '../../model/user';
import {ConfigService} from '../../services/config.service';
import {WindowService} from '../../services/window.service';
import * as firebase from 'firebase';


const password = new FormControl('', Validators.required);
const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

	public form: FormGroup;
	public formVerify: FormGroup;
	public codes: any;
	public stateFormVerification = false;

	/** control for the selected bank */
	public codeCtrl: FormControl = new FormControl();

	/** control for the MatSelect filter keyword */
	windowRef: any;
	user: any;

	public recaptchaVerifier: firebase.auth.RecaptchaVerifier;

	constructor(private fb: FormBuilder, private router: Router, private globals: Globals,
	            private userService: UserService, private authService: AuthService,
	            private configService: ConfigService, private win: WindowService) {
	}

	ngOnInit() {
		this.form = this.fb.group({
			phoneNumber: [null, Validators.compose([Validators.required])],
			password: password,
			confirmPassword: confirmPassword,
			dialSelected: {}
		});
		this.userService.getCountryCodes().subscribe(data => {
			this.codes = data;
			this.codeCtrl.setValue(this.globals.DEFAULT_DIAL_CODE);
		});

		this.formVerify = this.fb.group({
			verificationCode: [null, Validators.compose([Validators.required])]
		});

		if (!firebase.apps.length) {
			firebase.initializeApp(this.globals.FIREBASE_CONFIG);
		}


		// Todo render captcha
		this.windowRef = this.win.windowRef;
		setTimeout(() => {
			this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
			this.windowRef.recaptchaVerifier.render();
		}, 1000);
	}

	onSubmit() {
		this.verifyLoginCode().then(response => {
			const user: User = {
				user_name: this.codeCtrl.value + "" + parseInt(this.form.controls.phoneNumber.value),
				password: this.form.controls.password.value,
				access_token: response.toString(),
				platform: 'web'
			};

			this.userService.register(user).subscribe(data => {
				if (data.status === true) {
					this.authService.setSession(data);
					this.configService.setConfig();
					this.stateFormVerification = false;
					this.router.navigate([this.authService.redirectToProfile]);
				}
			});
		});

	}

	sendLoginCode() {
		const appVerifier = this.windowRef.recaptchaVerifier;
		const num = this.codeCtrl.value + this.form.controls.phoneNumber.value;
		firebase.auth().signInWithPhoneNumber(num, appVerifier)
			.then(result => {
				this.windowRef.confirmationResult = result;
				this.stateFormVerification = true;
			})
			.catch(error => console.log(error));
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


}
