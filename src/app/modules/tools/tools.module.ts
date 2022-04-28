import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {ToolsRoutes} from './tools.routing';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatMenuModule, MatProgressBarModule, MatFormFieldModule,
        MatNativeDateModule}
    from '@angular/material';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {DeviceService} from "../../services/device.service";
import {MessageService} from "../../services/message.service";
import {PipeModule} from "../../pipe/pipe.module";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {GeneralService} from "../../services/general.service";
import {UserComponent} from "./user/user.component";
import {UserService} from "../../services/user.service";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {BranchComponent} from "./branch/branch.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {SuppliesComponent} from './supplies/supplies.component';
import {SuppliesService} from '../../services/supplies.service';
import {ReportSettingComponent} from './report-setting/report-setting.component';
import {ReportService} from '../../services/report.service';
import {UnitComponent} from './unit/unit.component';
import {UnitService} from '../../services/unit.service';
import {TablePositionComponent} from './table-position/table-position.component';
import { TableComponent } from './table/table.component';
import {TableService} from '../../services/table.service';
import { GeneralComponent } from './general/general.component';
import {CustomerComponent} from './customer/customer.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ToolsRoutes),
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatProgressBarModule,
        MatMenuModule,
        FlexLayoutModule,
        MatFormFieldModule,
        NgxDatatableModule,
        ReactiveFormsModule,
        MatSelectModule,
        PipeModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        FormsModule,
        MatSlideToggleModule
    ],
	declarations: [UserComponent, BranchComponent, SuppliesComponent, ReportSettingComponent, UnitComponent, TablePositionComponent,
        TableComponent, GeneralComponent, CustomerComponent],
    providers: [DeviceService, MessageService, GeneralService, UserService, SuppliesService, ReportService, UnitService, TableService]
})
export class ToolsModule {
}
