import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {ToolsRoutes} from './category.routing';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
    MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatMenuModule, MatProgressBarModule, MatFormFieldModule,
    MatNativeDateModule, MatDialogModule, MatTabsModule, MatChipsModule
}
    from '@angular/material';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MessageService} from "../../services/message.service";
import {PipeModule} from "../../pipe/pipe.module";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {CategoryComponent} from './category/category.component';
import {CategoryService} from '../../services/category.service';
import {ItemComponent} from './item/item.component';
import {GeneralService} from '../../services/general.service';
import {ComboComponent, ComboDialogComponent, EditDialogComponent, ImportDialogComponent} from './combo/combo.component';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {SuppliesService} from '../../services/supplies.service';
import {AddItemDialogComponent, RestaurantConfigComponent} from './restaurant-config/restaurant-config.component';
import {ProductService} from '../../services/product.service';
import {UnitService} from '../../services/unit.service';
import {ExcelService} from '../../services/excel.service';
import {EditItemDialogComponent, ItemBranchComponent, UpdateDialogComponent} from './item-branch/item-branch.component';

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
        MatSlideToggleModule,
        MatDialogModule,
        NgxMatSelectSearchModule,
        MatTabsModule,
        MatChipsModule
    ],
	declarations: [CategoryComponent, ItemComponent, ComboComponent, ComboDialogComponent, RestaurantConfigComponent, ImportDialogComponent,
        EditDialogComponent, ItemBranchComponent, EditItemDialogComponent, UpdateDialogComponent, AddItemDialogComponent],
    providers: [CategoryService, MessageService, GeneralService, SuppliesService, ProductService, UnitService, ExcelService],
    entryComponents: [ComboDialogComponent, ImportDialogComponent, EditDialogComponent, EditItemDialogComponent, UpdateDialogComponent, AddItemDialogComponent],
})
export class CategoryModule {
}
