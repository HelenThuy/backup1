import {Routes} from '@angular/router';
import {PosComponent} from './pos/pos.component';
import {HistoryComponent} from './history/history.component';
import {TransactionComponent} from './transaction/transaction.component';

export const PosRoutes: Routes = [
    {
        path: 'dat-mon',
        component: PosComponent
    },
    {
        path: 'history',
        component: HistoryComponent
    },
    {
        path: 'transaction',
        component: TransactionComponent
    }
];

