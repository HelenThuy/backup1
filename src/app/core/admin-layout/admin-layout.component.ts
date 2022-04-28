import {Component, ElementRef, NgZone, OnInit, OnDestroy, ViewChild, HostListener, Output, EventEmitter} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {Subscription} from 'rxjs';


import {TranslateService} from '@ngx-translate/core';

import {PerfectScrollbarConfigInterface, PerfectScrollbarDirective} from 'ngx-perfect-scrollbar';
import {SettingService} from '../../services/setting.service';
import {filter} from 'rxjs/operators';

const SMALL_WIDTH_BREAKPOINT = 960;

@Component({
	selector: 'app-layout',
	templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

	private _router: Subscription;

	mediaMatcher: MediaQueryList = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`);
	url: string;
	sidePanelOpened;
	options = {
		collapsed: false,
		compact: false,
		boxed: false,
		dark: false,
		dir: 'ltr'
	};
	dataNoti: any;
	page: number = 1;

	@ViewChild('sidemenu') sidemenu;
	@ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;

    @Output() settingEvent = new EventEmitter();

	public config: PerfectScrollbarConfigInterface = {};

	constructor(
		private _element: ElementRef,
		private router: Router,
		private settingService: SettingService,
		zone: NgZone) {
		this.mediaMatcher.addListener(mql => zone.run(() => {
			this.mediaMatcher = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`);
		}));
	}

	ngOnInit(): void {

		this.url = this.router.url;

		this._router = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
			document.querySelector('.app-inner > .mat-drawer-content > div').scrollTop = 0;
			this.url = event.url;
			this.runOnRouteChange();
		});
	}

	ngOnDestroy(): void {
		this._router.unsubscribe();
	}

	runOnRouteChange(): void {
		if (this.isOver()) {
			this.sidemenu.close();
		}

		this.updatePS();
	}

	receiveOptions($event): void {
		this.options = $event;
	}

	receiveSetting($event): void {
		this.settingService.emitChange($event);
	}

	isOver(): boolean {
		if (this.url === '/apps/messages' ||
			this.url === '/apps/calendar' ||
			this.url === '/apps/media' ||
			this.url === '/maps/leaflet' ||
			this.url === '/taskboard') {
			return true;
		} else {
			return this.mediaMatcher.matches;
		}
	}

	menuMouseOver(): void {
		if (this.mediaMatcher.matches && this.options.collapsed) {
			this.sidemenu.mode = 'over';
		}
	}

	menuMouseOut(): void {
		if (this.mediaMatcher.matches && this.options.collapsed) {
			this.sidemenu.mode = 'side';
		}
	}

	updatePS(): void {
		if (!this.mediaMatcher.matches && !this.options.compact) {
			setTimeout(() => {
				this.directiveScroll.update();
			}, 350);
		}
	}

	getNoti(e) {
		// if (e._opened == false && !this.dataNoti) {
		this.dataNoti = [];
		if (e._opened == false) {
			this.settingService.getListNoti().subscribe(data => {
				if (data.status == true) {
					this.dataNoti = data.results;
					this.page = 1;
				}

			});
		}
	}
}
