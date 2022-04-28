import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {HomeRoutes} from './home.routing';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HomeComponent} from './home.component';
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule, MatSelectModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import {GeneralService} from '../../services/general.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(HomeRoutes),
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatProgressBarModule,
        MatMenuModule,
        FlexLayoutModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
	declarations: [HomeComponent],
    providers: [GeneralService]
})
export class HomeModule {
}
