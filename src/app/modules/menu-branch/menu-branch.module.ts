import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RouterModule} from '@angular/router';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule, MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule, MatSelectModule
} from '@angular/material';
import {MenuBranchRoutes} from './menu-branch.routing';
import {MenuBranchComponent} from './menu-branch.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CategoryService} from '../../services/category.service';
import {MessageService} from '../../services/message.service';
import {GeneralService} from '../../services/general.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(MenuBranchRoutes),
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
    ],
    declarations: [MenuBranchComponent],
    providers: [CategoryService, MessageService, GeneralService]
})
export class MenuBranchModule {
}
