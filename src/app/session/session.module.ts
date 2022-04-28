import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule, MatCardModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatSelectModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';

import {SessionRoutes} from './session.routing';
import {NotFoundComponent} from './not-found/not-found.component';
import {ErrorComponent} from './error/error.component';
import {ForgotComponent} from './forgot/forgot.component';
import {LockscreenComponent} from './lockscreen/lockscreen.component';
import {SigninComponent} from './signin/signin.component';
import {SignupComponent} from './signup/signup.component';
import {UserService} from '../services/user.service';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {WindowService} from '../services/window.service';
import {SettingsComponent} from './settings/settings.component';
import {ProfileComponent} from './profile/profile.component';
import {ProfileModule} from '../modules/profile/profile.module';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(SessionRoutes),
		MatIconModule,
		MatCardModule,
		MatInputModule,
		MatCheckboxModule,
		MatButtonModule,
		FlexLayoutModule,
		FormsModule,
		ReactiveFormsModule,
		MatSelectModule,
		NgxMatSelectSearchModule,
		NgSelectModule,
		ProfileModule
	],
	declarations: [
		NotFoundComponent,
		ErrorComponent,
		ForgotComponent,
		LockscreenComponent,
		SigninComponent,
		SignupComponent,
        SettingsComponent,
		ProfileComponent
	],
	providers: [
		UserService, WindowService
	]
})

export class SessionModule {
}
