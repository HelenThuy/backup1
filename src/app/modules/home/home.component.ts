import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {SettingService} from '../../services/setting.service';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {GeneralService} from '../../services/general.service';
import {FormControl, FormGroup} from '@angular/forms';
import {MessageService} from '../../services/message.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    settingsForm: FormGroup;
	public menus = [];
    setting: any;
    branches: any;
    show = false;

	constructor(private cookieService: CookieService, private settingService: SettingService,private router: Router,
                private localStorage: LocalStorage, private generalService: GeneralService, private messageService: MessageService) {
	}

	ngOnInit() {
        this.localStorage.getItem('setting').subscribe(data => {
            if (data !== null && data.role.role_id == 1) {
                this.show = true;
                this.setting = data;

                // todo: set form settings
                this.settingsForm = new FormGroup({
                    branch: new FormControl('', {updateOn: 'submit'}),
                });

                this.generalService.getBranch({status: 1}).subscribe(dataBranch => {
                    if(dataBranch.status == true && dataBranch.results) {
                        this.branches = dataBranch.results;
                    } else {
                        this.branches = [];
                    }
                });

                this.settingsForm.setValue({
                    branch: this.setting.branch
                });
            } else if (data !== null && (data.role.role_id == 1 || data.role.role_id == 5)) {
                this.router.navigate(['/order/dat-mon']);
            } else {
                this.router.navigate(['/order/transaction']);
            }
        });


	}

    sendSetting() {
	    if (this.settingsForm.value.branch) {
	        console.log(this.settingsForm.value.branch);
            this.setting.branch = {
                branch_id: (this.settingsForm.value.branch._id) ? this.settingsForm.value.branch._id : this.settingsForm.value.branch.branch_id,
                branch_name: this.settingsForm.value.branch.branch_name,
                branch_code: this.settingsForm.value.branch.branch_code,
                tax_rate: this.settingsForm.value.branch.tax_rate,
                service_rate: this.settingsForm.value.branch.service_rate,
                status: this.settingsForm.value.branch.status
            }

            this.cookieService.set('branch_id', this.setting.branch.branch_id.toString(), 1, '/');
            this.cookieService.set('branch_code', this.setting.branch.branch_code, 1, '/');

            this.localStorage.setItemSubscribe('setting', this.setting);

            this.settingService.emitChange(this.setting);

            this.messageService.open('Cập nhật chi nhánh thành công!', 'X', 'success');
        }
    }


    compareObjects(c1:any, c2:any) {
        return (c1.branch_code == c2.branch_code)
    }
}
