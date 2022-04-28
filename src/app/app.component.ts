import {Component, enableProdMode} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CustomIconService} from './services/custom-icon.service';
import {environment} from '../environments/environment';

@Component({
	selector: 'app-root',
	template: '<router-outlet></router-outlet>'
})
export class AppComponent {
	constructor(translate: TranslateService, private customIconService: CustomIconService) {
		translate.addLangs(['en', 'fr']);
		translate.setDefaultLang('en');
		customIconService.setIcons();
		const browserLang: string = translate.getBrowserLang();
		translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');

		if (environment.production) {
			if (window) {
				window.console.log = window.console.warn = window.console.info = function () {
					// Don't log anything.
				};
			}
		}
	}
}
