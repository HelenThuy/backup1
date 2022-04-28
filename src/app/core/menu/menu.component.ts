import {Component, NgZone, ViewChild, Output, EventEmitter} from '@angular/core';
import {MenuService} from './menu.service';
import {CookieService} from 'ngx-cookie-service';
import {TranslateService} from '@ngx-translate/core';
import {SettingService} from '../../services/setting.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	providers: [MenuService]
})
export class MenuComponent {
	currentLang = 'en';

	constructor(
		private cookieService: CookieService,
		public settingService: SettingService,
		public menuService: MenuService,
		public translate: TranslateService,
	) {
	}

	public menuItems;

	ngOnInit() {
        let role = (this.cookieService.get('role_id')) ? this.cookieService.get('role_id') : 3;

        this.menuItems = this.menuService.getAll(role);
		// this.settingService.changeEmitted$.subscribe(data => {
			// here fetch data from the session storage
		// });
	}


	addMenuItem(): void {
		this.menuService.add({
			state: 'menu',
			name: 'MENU',
			type: 'sub',
			icon: 'trending_flat',
			children: [
				{state: 'menu', name: 'MENU'},
				{state: 'timeline', name: 'MENU'}
			]
		});
	}


}
