import {Routes} from '@angular/router';

import {NotFoundComponent} from './not-found/not-found.component';
import {ErrorComponent} from './error/error.component';
import {ForgotComponent} from './forgot/forgot.component';
import {LockscreenComponent} from './lockscreen/lockscreen.component';
import {SigninComponent} from './signin/signin.component';
import {SignupComponent} from './signup/signup.component';
import {SettingsComponent} from './settings/settings.component';
import {ProfileComponent} from './profile/profile.component';

export const SessionRoutes: Routes = [
	{
		path: '',
		children: [{
			path: '404',
			component: NotFoundComponent
		}, {
			path: 'error',
			component: ErrorComponent
		}, {
			path: 'forgot',
			component: ForgotComponent
		}, {
			path: 'lockscreen',
			component: LockscreenComponent
		}, {
			path: 'signin',
			component: SigninComponent
		}, {
			path: 'signup',
			component: SignupComponent
		}, {
            path: 'settings',
            component: SettingsComponent
        }, {
            path: 'profile',
            component: ProfileComponent
        }]
	}
];
