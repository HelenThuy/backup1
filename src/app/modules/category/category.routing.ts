import {Routes} from '@angular/router';
import {CategoryComponent} from './category/category.component';
import {ItemComponent} from './item/item.component';
import {ComboComponent} from './combo/combo.component';
import {RestaurantConfigComponent} from './restaurant-config/restaurant-config.component';
import {ItemBranchComponent} from './item-branch/item-branch.component';

export const ToolsRoutes: Routes = [
    {
        path: 'category',
        component: CategoryComponent,
    },
    {
        path: 'item',
        component: ComboComponent,
    },
    {
        path: 'item-branch',
        component: ItemBranchComponent,
    },
    {
        path: 'config',
        component: RestaurantConfigComponent,
    },
    // {
    //     path: 'combo',
    //     component: ComboComponent,
    // }
];

