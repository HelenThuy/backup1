import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {LoadingBarRouterModule} from '@ngx-loading-bar/router';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {PERFECT_SCROLLBAR_CONFIG} from 'ngx-perfect-scrollbar';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {AgmCoreModule} from '@agm/core';

import {
    MatSidenavModule,
    MatCardModule,
    MatMenuModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatListModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressBarModule, MatSnackBarModule, MatRadioModule, MatBadgeModule, MatSpinner, MatProgressSpinnerModule, MatDialogModule,
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BidiModule} from '@angular/cdk/bidi';

import {
	MenuComponent,
	HeaderComponent,
	SidebarComponent,
	NotificationComponent,
	OptionsComponent,
	AdminLayoutComponent,
	AuthLayoutComponent,
	AccordionAnchorDirective,
	AccordionLinkDirective,
	AccordionDirective
} from './core';

import {AppRoutes} from './app.routing';
import {AppComponent} from './app.component';
import {CustomIconService} from './services/custom-icon.service';
import {Globals} from './app.globals';
import {ResultsService} from './services/results.service';
import {Results} from './model/results';
import {AuthGuardService} from './services/auth-guard.service';
import {CookieService} from 'ngx-cookie-service';
import {AuthInterceptor} from './services/http-interceptor.service';
import {ConfigService} from './services/config.service';
import {SettingService} from './services/setting.service';
import {Setting} from './model/setting';
import {MessageService} from './services/message.service';
import {UiSpinnerService} from './services/ui/ui-spinner-service';
import {Dir} from '@angular/cdk/bidi';
import {CustomEncoder} from './model/custom-encoder';
import {AuthService} from './services/auth.service';
import {NoneLayoutComponent} from './core/none-layout/none-layout.component';
import {PipeModule} from './pipe/pipe.module';
import { OverlayModule } from '@angular/cdk/overlay';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ConfirmDialogComponent} from './core/confirm-dialog/confirm-dialog.component';

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true,
	wheelSpeed: 2,
	wheelPropagation: true,
	minScrollbarLength: 20
};

@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		SidebarComponent,
		NotificationComponent,
		OptionsComponent,
		MenuComponent,
		AdminLayoutComponent,
		AuthLayoutComponent,
		NoneLayoutComponent,
		AccordionAnchorDirective,
		AccordionLinkDirective,
		AccordionDirective,
        ConfirmDialogComponent
	],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(AppRoutes),
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        LoadingBarRouterModule,
        MatSidenavModule,
        MatCardModule,
        MatMenuModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        MatTabsModule,
        MatListModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatProgressBarModule,
        MatRadioModule,
        FlexLayoutModule,
        BidiModule,
        AgmCoreModule.forRoot({apiKey: 'YOURAPIKEY'}),
        PerfectScrollbarModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        MatBadgeModule,
        PipeModule,
        MatProgressSpinnerModule,
        OverlayModule,
        InfiniteScrollModule,
        MatDialogModule
    ],
	providers: [
		Globals, ResultsService, Results, AuthGuardService, AuthService, CookieService, ConfigService, SettingService,
		Setting, MessageService, Dir, CustomEncoder, UiSpinnerService,
		{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		}, CustomIconService
	],
    entryComponents: [ MatSpinner, ConfirmDialogComponent ],
	bootstrap: [AppComponent]
})
export class AppModule {
}
