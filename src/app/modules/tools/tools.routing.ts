import {Routes} from '@angular/router';
import {UserComponent} from "./user/user.component";
import {BranchComponent} from "./branch/branch.component";
import {SuppliesComponent} from './supplies/supplies.component';
import {ReportSettingComponent} from './report-setting/report-setting.component';
import {UnitComponent} from './unit/unit.component';
import {TablePositionComponent} from './table-position/table-position.component';
import {TableComponent} from './table/table.component';
import {GeneralComponent} from './general/general.component';
import {CustomerComponent} from './customer/customer.component';

export const ToolsRoutes: Routes = [
    {
        path: 'quan-ly-vat-tu',
        component: SuppliesComponent
    },
    {
        path: 'quan-ly-chi-nhanh',
        component: BranchComponent
    },
    {
        path: 'quan-ly-tai-khoan',
        component: UserComponent
    },
    {
        path: 'quan-ly-ban',
        component: TableComponent
    },
    {
        path: 'table-position',
        component: TablePositionComponent

    },
    {
        path: 'report-setting',
        component: ReportSettingComponent

    },
    {
        path: 'quan-ly-don-vi-tinh',
        component: UnitComponent

    },
    {
        path: 'quan-ly-khach-hang',
        component: CustomerComponent

    },
    {
        path: 'cau-hinh-chung',
        component: GeneralComponent

    }
];

