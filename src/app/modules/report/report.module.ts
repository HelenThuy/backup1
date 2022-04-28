import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
    MatButtonModule,
    MatCardModule, MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule, MatInputModule,
    MatListModule,
    MatMenuModule, MatNativeDateModule,
    MatProgressBarModule, MatRadioModule, MatSelectModule
} from '@angular/material';
import {ReportRoutes} from './report.routing';
import {ReportComponent} from './report.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessageService} from '../../services/message.service';
import {GeneralService} from '../../services/general.service';
import {ReportService} from '../../services/report.service';
import {NgxMatDatetimePickerModule, NgxMatNativeDateModule} from '@angular-material-components/datetime-picker';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ReportRoutes),
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatProgressBarModule,
        MatMenuModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatRadioModule,
        MatDatepickerModule,
        NgxMatDatetimePickerModule,
        MatNativeDateModule,
        NgxMatNativeDateModule,
        NgxMatSelectSearchModule
    ],
    declarations: [ReportComponent],
    providers: [ReportService, MessageService, GeneralService]
})
export class ReportModule {
}
