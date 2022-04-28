import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {AccountKit, AuthResponse} from 'ng2-account-kit';
import {UserService} from '../../services/user.service';
import {AuthService} from '../../services/auth.service';
import {User} from '../../model/user';
import {ConfigService} from '../../services/config.service';
import {Globals} from '../../app.globals';
import {MessageService} from '../../services/message.service';


@Component({
	selector: 'app-signin',
	templateUrl: './signin.component.html',
	styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

	public form: FormGroup;

	public codes: any;

	/** control for the selected bank */
	public codeCtrl: FormControl = new FormControl();

	/** control for the MatSelect filter keyword */
	public codeFilterCtrl: FormControl = new FormControl();

	constructor(private fb: FormBuilder, private router: Router, private userService: UserService, private authService: AuthService,
	            private configService: ConfigService, private messageService: MessageService) {
	}

	ngOnInit() {
		this.form = this.fb.group({
			phoneNumber: [null, Validators.compose([Validators.required])],
            password: [null, Validators.compose([Validators.required])]
		});
	}

	onSubmit() {
		const user = {
            username: this.form.controls.phoneNumber.value,
			password: this.form.controls.password.value,
		};

		this.messageService.close();

		this.authService.login(user).subscribe(data => {
			if (typeof data !== 'string' &&  data.status === true) {
				this.authService.setSession(data);
				// this.configService.setConfig();
                this.router.navigate(['/']);
			} else {
				this.messageService.open('Sai tài khoản hoặc mật khẩu', 'X', 'error');
			}
		});
	}

}
