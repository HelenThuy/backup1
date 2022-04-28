import {Routes} from '@angular/router';
import {ProfileComponent} from './profile.component';
import {AddProfileComponent} from './add-profile/add-profile.component';
import {InfoComponent} from './info/info.component';
import {PasswordComponent} from './password/password.component';

export const ProfileRoutes: Routes = [
	{
		path: '',
		component: ProfileComponent
	},
	{
		path: 'info',
		component: InfoComponent
	},
	{
		path: 'change-password',
		component: PasswordComponent
	},
	{
		path: 'add-profile',
		component: AddProfileComponent
	},
	{
		path: 'edit-profile/:id',
		component: AddProfileComponent
	},
];
