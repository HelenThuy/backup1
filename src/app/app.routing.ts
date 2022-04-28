import {Routes} from '@angular/router';
import {AuthGuardService} from './services/auth-guard.service';
import {AdminLayoutComponent, AuthLayoutComponent} from './core';
import {NoneLayoutComponent} from './core/none-layout/none-layout.component';

export const AppRoutes: Routes = [
	{
		path: '',
		canActivate: [AuthGuardService],
		component: AdminLayoutComponent,
		children: [
			{
				path: '',
				// canActivateChild: [AuthGuardService],
				loadChildren: './modules/home/home.module#HomeModule'
			},
			{
				path: 'profile',
				// canActivateChild: [AuthGuardService],
				loadChildren: './modules/profile/profile.module#ProfileModule'
			},
            {
                path: 'tools',
                loadChildren: './modules/tools/tools.module#ToolsModule'
            },
            {
                path: 'menu',
                loadChildren: './modules/category/category.module#CategoryModule'
            },
            {
                path: 'menu-branch',
                loadChildren: './modules/menu-branch/menu-branch.module#MenuBranchModule'
            },
            {
                path: 'booking',
                loadChildren: './modules/booking/booking.module#BookingModule'
            },
            {
                path: 'order',
                loadChildren: './modules/order/order.module#OrderModule'
            },
            {
                path: 'he-thong-bao-cao',
                loadChildren: './modules/report/report.module#ReportModule'
            }
		]
	},
	{
		path: '',
		component: AuthLayoutComponent,
		children: [{
			path: 'session',
			loadChildren: './session/session.module#SessionModule'
		}]
	},
	{
		path: '',
		component: NoneLayoutComponent,
		children: [{
			path: 'privacy',
			loadChildren: './policy/policy.module#PolicyModule'
		}]
	},
	{
		path: '**',
		redirectTo: 'session/404'
	}
];
