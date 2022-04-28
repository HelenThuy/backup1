import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {BookingRoutes} from './booking.routing';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BookingComponent} from './booking.component';
import {MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatMenuModule, MatProgressBarModule} from '@angular/material';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(BookingRoutes),
		MatIconModule,
		MatCardModule,
		MatButtonModule,
		MatListModule,
		MatProgressBarModule,
		MatMenuModule,
		FlexLayoutModule,
	],
	declarations: [BookingComponent]
})
export class BookingModule {
}
