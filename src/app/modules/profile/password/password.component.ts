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
import {UserService} from '../../../services/user.service';

@Component({
	selector: 'app-profile-password',
	templateUrl: './password.component.html',
	styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
	@Input() register: boolean = false;
	public updatePasswordForm: FormGroup;
	companies: Company[] = [];
	profile: any;
	currentCompany: Company;
	public services: any;
	is_register = 0;
	error = '';

	constructor(private profileService: ProfileService, private router: Router, private localStorage: LocalStorage,
	            private userService: UserService, private messageService: MessageService) {
	}

	ngOnInit() {
		this.updatePasswordForm = new FormGroup({
			old_password: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
            new_password: new FormControl(null, {validators: Validators.required, updateOn: 'submit'}),
			confirm_password: new FormControl(null, {validators: Validators.required, updateOn: 'submit'})
		});

		this.localStorage.getItem('profile').subscribe((data) => {
			this.profile = data;
		});
	}

    changePassword() {
	    this.error = '';
	    if (this.updatePasswordForm.value.new_password != this.updatePasswordForm.value.confirm_password) {
	        this.error = "Mật khẩu mới và xác nhận mật khẩu không khớp!";
	        return false;
        }

        const params = {
	        old_password: this.updatePasswordForm.value.old_password,
            new_password: this.updatePasswordForm.value.new_password,
        }

        this.userService.changePass(params).subscribe(data => {
            if (data.status) {
                this.messageService.open('Cập nhật mật khẩu thành công!', 'X', 'success');
            } else {
                if (data.errors && data.errors.message) {
                    this.messageService.open(data.errors.message, 'X', 'error');
                } else {
                    this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
                }
            }
        });

    }

}
