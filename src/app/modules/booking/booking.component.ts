import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {SettingService} from '../../services/setting.service';

@Component({
	selector: 'app-home',
	templateUrl: './booking.component.html',
	styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
	public menus = [];
	private defaultMenu = [
		{
			state: 'patient-assign',
			module: 'assign',
			name: 'Lịch hẹn',
			type: 'router',
			icon: 'c_health_report'
		},
		{
			state: 'schedule',
			module: 'reception',
			name: 'Đặt lịch',
			type: 'router',
			icon: 'c_phone'
		},
		{
			state: 'info',
			module: 'assign',
			name: 'Thông tin chỉ định',
			type: 'router',
			icon: 'c_report'
		},
		{
			state: 'history',
			module: 'pay',
			name: 'Lịch sử thanh toán',
			type: 'router',
			icon: 'c_chart'
		},
		{
			state: 'medical-history',
			module: '',
			name: 'Bệnh sử',
			type: 'router',
			icon: 'c_medical_report'
		},
		{
			state: 'membership',
			module: '',
			name: 'Thông tin thành viên',
			type: 'router',
			icon: 'c_membership'
		},
		{
			state: 'hospital',
			module: '',
			name: 'Tìm bệnh viện',
			type: 'router',
			icon: 'c_hospital'
		},
		{
			state: 'promotion',
			module: '',
			name: 'Khuyến mãi',
			type: 'router',
			icon: 'c_percentage_off_sticker'
		},
		{
			state: 'doctor',
			module: '',
			name: 'Tìm bác sĩ',
			type: 'router',
			icon: 'c_doctor'
		}
	];

	private doctorMenu = [
		{
			state: 'medical-history',
			module: '',
			name: 'Tiếp nhận bệnh nhân',
			type: 'router',
			icon: 'c_medical_report'
		},
		{
			state: 'info',
			module: 'assign',
			name: 'Thông tin chỉ định',
			type: 'router',
			icon: 'c_report'
		},
		{
			state: 'calendar',
			module: 'reception',
			name: 'Xác nhận lịch hẹn',
			type: 'router',
			icon: 'c_health_report'
		},
		{
			state: 'medical-history',
			module: '',
			name: 'Lịch làm việc',
			type: 'router',
			icon: 'c_medical_report'
		},
		{
			state: 'history',
			module: 'pay',
			name: 'Lịch sử thanh toán',
			type: 'router',
			icon: 'c_chart'
		},
		{
			state: 'medical-history',
			module: '',
			name: 'Bệnh sử',
			type: 'router',
			icon: 'c_medical_report'
		},
	];

	constructor(private cookieService: CookieService, private settingService: SettingService) {
	}

	ngOnInit() {
		this.settingService.changeEmitted$.subscribe(data => {
			this.get();
		});
		this.get();
	}

	get() {
		let role = (this.cookieService.get('role_id')) ? this.cookieService.get('role_id') : 3;
		if (role == 1) {
			this.menus = this.doctorMenu;
		} else {
			this.menus = this.defaultMenu;
		}
	}
}
