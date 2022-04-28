import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {PosRoutes} from './order.routing';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
    MatButtonModule, MatCardModule, MatIconModule, MatListModule, MatMenuModule, MatProgressBarModule, MatFormFieldModule,
    MatNativeDateModule, MatSidenavModule, MatDialogModule, MatAutocompleteModule
}
    from '@angular/material';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {MessageService} from "../../services/message.service";
import {PipeModule} from "../../pipe/pipe.module";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {GeneralService} from "../../services/general.service";
import {UserService} from "../../services/user.service";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {
    BillDialogComponent,
    ComboDialogComponent, CommissionDialogComponent,
    FeeDialogComponent, NoteCancelItemDialogComponent,
    NoteDialogComponent,
    PaymentDialogComponent,
    PosComponent, VoucherDialogComponent
} from './pos/pos.component';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {CategoryService} from '../../services/category.service';
import {PosService} from '../../services/pos.service';
import {HistoryComponent, NoteCancelDialogComponent} from './history/history.component';
import {TableService} from '../../services/table.service';
import {TransactionComponent} from './transaction/transaction.component';
import {ReportService} from '../../services/report.service';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {ConfirmDialogComponent} from '../../core/confirm-dialog/confirm-dialog.component';
import {VoucherService} from '../../services/voucher.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(PosRoutes),
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
        MatSidenavModule,
        PerfectScrollbarModule,
        MatDialogModule,
        MatAutocompleteModule,
        NgxMatSelectSearchModule
    ],
    declarations: [PosComponent, FeeDialogComponent, NoteDialogComponent, BillDialogComponent, PaymentDialogComponent, HistoryComponent,
        ComboDialogComponent, CommissionDialogComponent, TransactionComponent, NoteCancelDialogComponent, NoteCancelItemDialogComponent, VoucherDialogComponent],
    entryComponents: [FeeDialogComponent, NoteDialogComponent, BillDialogComponent, PaymentDialogComponent, ComboDialogComponent, CommissionDialogComponent,
        NoteCancelDialogComponent, NoteCancelItemDialogComponent, VoucherDialogComponent
    ],
    providers: [CategoryService, MessageService, GeneralService, UserService, PosService, TableService, ReportService, VoucherService]
})
export class OrderModule {
}
