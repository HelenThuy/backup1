import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile.component';
import {RouterModule} from '@angular/router';
import {ProfileRoutes} from './profile.routing';
import {
	MatButtonModule,
	MatButtonToggleModule,
	MatCardModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatExpansionModule, MatGridListModule,
	MatIconModule,
	MatInputModule,
	MatListModule, MatMenuModule, MatProgressBarModule, MatRadioModule, MatSelectModule, MatSidenavModule,
	MatTabsModule,
	MatToolbarModule
} from '@angular/material';
import {AddProfileComponent} from './add-profile/add-profile.component';
import {InfoComponent} from './info/info.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProfileService} from '../../services/profile.service';
import {PipeModule} from '../../pipe/pipe.module';
import {FlexModule} from '@angular/flex-layout';
import {ConfigService} from '../../services/config.service';
import {WindowService} from '../../services/window.service';
import {PasswordComponent} from './password/password.component';
import {UserService} from '../../services/user.service';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(ProfileRoutes),
		MatToolbarModule,
		MatIconModule,
		MatCardModule,
		MatInputModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatListModule,
		MatGridListModule,
		MatMenuModule,
		MatSidenavModule,
		MatProgressBarModule,
		MatTabsModule,
		MatDialogModule,
		MatExpansionModule,
		MatRadioModule,
		NgSelectModule,
		FormsModule,
		ReactiveFormsModule,
		MatSelectModule,
		PipeModule,
		MatDatepickerModule,
		MatNativeDateModule,
		FlexModule,
	],
	declarations: [ProfileComponent, AddProfileComponent, InfoComponent, PasswordComponent],
	exports: [
		InfoComponent
	],
	providers: [ProfileService, WindowService, UserService]
})
export class ProfileModule {
}
