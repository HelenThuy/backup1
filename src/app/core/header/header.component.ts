import {Component, EventEmitter, OnInit, Output} from '@angular/core';

import * as screenfull from 'screenfull';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {SettingService} from '../../services/setting.service';
import {interval} from 'rxjs';
import {MessageService} from '../../services/message.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})

export class HeaderComponent  implements OnInit{
	@Output() toggleSidenav = new EventEmitter<void>();
	@Output() toggleNotificationSidenav = new EventEmitter<void>();
    @Output() settingEvent = new EventEmitter();

    branch_name: string;
    role_name: string;
    role_id: number;
    roles: any;
    user_name: string;
    company_name: string;
    noti: any;

	constructor(private authService: AuthService, private router: Router,
                private cookieService: CookieService, private localStorage: LocalStorage,
                private settingService: SettingService, private messageService: MessageService) {
	}

	ngOnInit(): void {
        // todo: get role  and user name
        this.localStorage.getItem('profile').subscribe(profile => {
            this.roles = profile.roles;
            this.user_name = profile.name;
        });

        // todo: get current role
        this.localStorage.getItem('setting').subscribe(data => {
            this.role_name = data.role.role_name;
            this.branch_name = data.branch.branch_name;
        });

        this.settingService.changeEmitted$.subscribe(data => {
            // tslint:disable-next-line:radix
	        this.branch_name = data.branch.branch_name;
            this.role_id = (this.cookieService.get('role_id')) ? parseInt(this.cookieService.get('role_id')) : 3;
            // this.setUserInfo(this.role_id);

	        //this.getCountNoti()
        });

		// const counter = interval(60000);
		// counter.subscribe(n => this.getCountNoti());
    }
    fullScreenToggle(): void {
		if (screenfull.enabled) {
			screenfull.toggle();
		}
	}
    setUserInfo (roleId): void {
	    const roleFilter = this.roles.filter(role => {
	        return (role.role_id == roleId);
        });
        roleFilter[0] && roleFilter[0].role_name ? this.role_name = roleFilter[0].role_name : this.role_name = '';
    }

	logout() {
		this.authService.logout().subscribe();
		this.router.navigate([this.authService.loginUrl]);
	}

	getCountNoti() {
		this.messageService.close();
		let params = {'check-total': 'notification'};
		if (this.role_id == 1) {
			params = {'check-total': 'calendar,notification'}
		}

		this.settingService.getCountNoti(params).subscribe(data => {
			if (data.status == true) {
				if (this.role_id == 1 && data.results.total_calendar > 0) {
					this.messageService.open('Bạn có ' + data.results.total_calendar + ' lịch hẹn cần xác nhận!', 'X', 'warning');
				}
				this.noti = data.results;
			}
		});
	}
}
