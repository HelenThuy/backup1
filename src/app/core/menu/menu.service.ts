import {Injectable} from '@angular/core';
import {Globals} from '../../app.globals';

export interface BadgeItem {
	type: string;
	value: string;
}

export interface ChildrenItems {
	state: string;
	name: string;
	type?: string;
}

export interface Menu {
	state: string;
	name: string;
	type: string;
	icon: string;
	badge?: BadgeItem[];
	children?: ChildrenItems[];
}

const MENUITEMS = [
	// {
	// 	state: '/',
	// 	name: 'HOME',
	// 	type: 'link',
	// 	icon: 'home'
	// },
    {
        state: 'order',
        name: 'Order',
        type: 'sub',
        icon: 'shopping_cart',
        children: [
            {state: 'dat-mon', name: 'Tạo order'},
            {state: 'history', name: 'Tổng hợp order'},
            {state: 'transaction', name: 'Tổng hợp order điều trị'},
        ]
    },
];

const NURSE_ITEMS = [
    {
        state: 'order',
        name: 'Order',
        type: 'sub',
        icon: 'shopping_cart',
        children: [
            {state: 'transaction', name: 'Tổng hợp order điều trị'},
        ]
    },
];

const LAUNDRY_ITEMS = [
    {
        state: 'order',
        name: 'Order',
        type: 'sub',
        icon: 'shopping_cart',
        children: [
            {state: 'dat-mon', name: 'Tạo order'},
            {state: 'history', name: 'Tổng hợp order'},
        ]

    },
];


const MANAGER_ITEMS = [
    // {
    //     state: '/',
    //     name: 'HOME',
    //     type: 'link',
    //     icon: 'home'
    // },
    {
        state: 'order',
        name: 'Order',
        type: 'sub',
        icon: 'shopping_cart',
        children: [
            {state: 'dat-mon', name: 'Tạo order'},
            {state: 'history', name: 'Tổng hợp order'},
            {state: 'transaction', name: 'Tổng hợp order điều trị'},
        ]
    },
    {
        state: 'he-thong-bao-cao',
        name: 'Hệ thống báo cáo',
        type: 'link',
        icon: 'description'
    },
    // {
    //     state: 'menu-branch',
    //     name: 'Cấu hình menu theo chi nhánh',
    //     type: 'link',
    //     icon: 'menu_book'
    // },
    // {
    //     state: 'menu',
    //     name: 'Quản lý món',
    //     type: 'sub',
    //     icon: 'restaurant_menu',
    //     children: [
    //         {state: 'category', name: 'Danh mục loại món ăn'},
    //         {state: 'item', name: 'Danh mục món ăn'},
    //         {state: 'config', name: 'Cấu hình món ăn trong tuần'}
    //     ]
    // },
];

const ADMIN_ITEMS = [
    {
        state: '/',
        name: 'HOME',
        type: 'link',
        icon: 'home'
    },
    {
        state: 'order',
        name: 'Order',
        type: 'sub',
        icon: 'shopping_cart',
        children: [
            {state: 'dat-mon', name: 'Tạo order'},
            {state: 'history', name: 'Tổng hợp order'},
            {state: 'transaction', name: 'Tổng hợp order điều trị'},
        ]
    },
    {
        state: 'menu-branch',
        name: 'Cấu hình menu theo chi nhánh',
        type: 'link',
        icon: 'menu_book'
    },
    {
        state: 'menu',
        name: 'Quản lý món',
        type: 'sub',
        icon: 'restaurant_menu',
        children: [
            {state: 'category', name: 'Danh mục loại món ăn'},
            {state: 'item', name: 'Danh mục món ăn'},
            {state: 'config', name: 'Cấu hình món ăn trong tuần'},
            {state: 'item-branch', name: 'Danh mục món ăn theo chi nhánh'}
        ]
    },
    {
        state: 'he-thong-bao-cao',
        name: 'Hệ thống báo cáo',
        type: 'link',
        icon: 'description'
    },
    {
        state: 'tools',
        name: 'Tools Admin',
        type: 'sub',
        icon: 'settings',
        children: [
            {state: 'cau-hinh-chung', name: 'Cấu hình chung'},
            {state: 'quan-ly-don-vi-tinh', name: 'Cấu hình đơn vị tính'},
            {state: 'report-setting', name: 'Cấu hình báo cáo'},
            {state: 'table-position', name: 'Phân khu, nhà hàng, bar'},
            {state: 'quan-ly-ban', name: 'Quản lý bàn'},
            {state: 'quan-ly-vat-tu', name: 'Quản lý vật tư'},
            {state: 'quan-ly-khach-hang', name: 'Quản lý khách hàng'},
            {state: 'quan-ly-chi-nhanh', name: 'Quản lý chi nhánh'},
            {state: 'quan-ly-tai-khoan', name: 'Quản lý tài khoản'},
        ]
    },
];


@Injectable()
export class MenuService {
	constructor(
		private globals: Globals
	) {
	}

	getAll(role_id): Menu[] {
		let menus;
		if (role_id == 1) {
			menus = ADMIN_ITEMS;
		} else if(role_id == 2){
			menus = MANAGER_ITEMS;
		} else if(role_id == 3) {
            menus = MENUITEMS;
        }  else if(role_id == 5) {
            menus = LAUNDRY_ITEMS;
        } else {
            menus = NURSE_ITEMS;
        }
        return (menus);
		// if (this.globals.ADMIN == 1) {
		// 	return (menus.concat(ADMIN_MENU_ITEMS));
		// } else {
		// 	return (menus);
		// }
	}

	add(menu: any) {
		MENUITEMS.push(menu);
	}
}
