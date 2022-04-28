import {Component, Input} from '@angular/core';
import {SettingService} from '../../services/setting.service';
import {Router} from '@angular/router';

@Component({
	selector: 'app-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
	@Input() data:any;
	@Input() page:any;
	selector: string = '.mat-tab-body-content';

	constructor(private settingService: SettingService, private router: Router) {
	}

	readNoti(noti) {
		if (!noti.read) {
			this.data = this.data.map(d => {
				if (d._id == noti._id) {
					d.read = true;
					const params = {
						read: true
					};

					this.settingService.readNoti(d._id, params).subscribe();
				}
				return d;
			});
		}

		this.redirect(noti.data.form)
	}

	redirect(e) {
		switch (e) {
			case 'xac-nhan-lich-hen':
				this.router.navigate(['/reception/check-schedule']);
				break;
			case 'lich-hen-benh-nhan-qrcode':
				this.router.navigate(['/reception/manage-schedule']);
				break;
			case 'benh_su':
				this.router.navigate(['/medical-history']);
				break;
			case 'khuyen-mai':
				this.router.navigate(['/promotion']);
				break;
		}
	}

	onScroll() {
		if (this.data.length <= 15) {
			this.page = 1;
		}
		this.page += 1;

		this.settingService.getListNoti(this.page + "").subscribe(data => {
			if (data.status == true && data.results) {
				this.data = this.data.concat(data.results);
			}
		});
	}
}
