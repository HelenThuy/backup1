import {Component, OnInit} from '@angular/core';
import {APP_DATE_FORMATS, AppDateAdapter} from "../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material/core";
import {CategoryService} from '../../services/category.service';
import {MessageService} from '../../services/message.service';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {UiSpinnerService} from '../../services/ui/ui-spinner-service';
import {GeneralService} from '../../services/general.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
	selector: 'app-admin-menu-branch',
	templateUrl: './menu-branch.component.html',
	styleUrls: ['./menu-branch.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class MenuBranchComponent implements OnInit {
    constructor(private generalService: GeneralService, private categoryService: CategoryService, private messageService: MessageService,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService) {
        this.uiSpinnerService.spin$.next(false);
    }
    searchForm: FormGroup;
    branches: any;
    selectedToAdd: any;
    selectedToRemove: any;
    selectedItems: any = [];

    assigned:any;
    products:any;
    rawAssigned:any;
    rawProducts:any;
    menuId: any;
    setting: any;
    curBranch: any;
    productSearch: any;

	ngOnInit() {
        this.searchForm = new FormGroup({
            branch: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.localStorage.getItem('setting').subscribe((setting) => {
            this.setting = setting;
            if (setting.role.role_id == 1) {
                this.getBranches();
            } else {
                this.getProducts();
            }
        });
	}

    /**
     * lay danh sach chi nhanh
     */
    getBranches() {
        this.generalService.getBranch().subscribe(data => {
            if(data.status == true && data.results) {
                this.branches = data.results;
            } else {
                this.branches = [];
            }
        });
    }

	getProducts() {
        if (this.searchForm.invalid && this.setting.role.role_id == 1) {
            return false;
        }

        const params = {
            category: "",
            status: 1,
        };

        if (this.setting.role.role_id == 1) {
            this.curBranch = {
                branch_id: this.searchForm.value.branch._id,
                branch_name: this.searchForm.value.branch.branch_name,
                branch_code: this.searchForm.value.branch.branch_code,
            };
        } else {
            this.curBranch = this.setting.branch;
        }

        // todo: lay danh sach tat ca san pham
        this.categoryService.getItem(params).subscribe(data => {
            if(data.status == true && data.results) {
                let listProduct = data.results;

                // todo: lay san pham da dc gan voi chi nhanh
                this.categoryService.getMenu(this.curBranch.branch_id, {}).subscribe(menu => {
                    if(menu.status == true && menu.results) {
                        this.assigned = menu.results.data;
                        this.rawAssigned = menu.results.data;
                        this.menuId = menu.results._id;

                        listProduct.forEach((product, index) => {
                            this.assigned.forEach(item => {
                                if (item._id == product._id) {
                                    listProduct[index] = '';
                                }
                            });
                        });

                        this.products = listProduct.filter(item => item !== '');
                        this.rawProducts = listProduct.filter(item => item !== '');
                    } else {
                        this.menuId = null;
                        this.assigned = [];
                        this.rawAssigned = [];
                        this.products = listProduct;
                        this.rawProducts = listProduct;
                    }
                });
            } else {
                this.products = [];
                this.rawProducts = [];
            }
        });
    }

    assign() {
	    if (this.selectedToAdd) {
            this.assigned = this.assigned.concat(this.selectedToAdd);
            this.rawAssigned = this.rawAssigned.concat(this.selectedToAdd);
            this.products = this.products.filter(selectedData => {
                return this.assigned.indexOf(selectedData) < 0;
            });

            this.rawProducts = this.rawProducts.filter(selectedData => {
                return this.rawAssigned.indexOf(selectedData) < 0;
            });
        }
        this.selectedToAdd = [];
    }

    unAssign() {
        if (this.selectedToRemove) {
            this.products = this.products.concat(this.selectedToRemove);
            this.rawProducts = this.rawProducts.concat(this.selectedToRemove);
            this.assigned = this.assigned.filter(selectedData => {
                return this.products.indexOf(selectedData) < 0;
            });

            this.rawAssigned = this.rawAssigned.filter(selectedData => {
                return this.rawProducts.indexOf(selectedData) < 0;
            });
        }
        this.selectedToRemove = [];
    }

    save() {
        if (!this.curBranch) {
            this.messageService.open('Dữ liệu không hợp lệ!', 'X', 'error');
            return false;
        }
        this.uiSpinnerService.spin$.next(true);
        let updateData = {
            branch_id: this.curBranch.branch_id,
            branch_name: this.curBranch.branch_name,
            branch_code: this.curBranch.branch_code,
            data: this.rawAssigned
        }

        this.categoryService.setMenu(this.menuId, updateData).subscribe(data => {
            if(data.status == true && data.results) {
                this.menuId = data.results
                this.messageService.open('Cập nhật thông tin thành công', 'X', 'success');
            } else {
                this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
            }
            this.uiSpinnerService.spin$.next(false);
        });
    }

    searchProduct(val) {
        let key = val.target.value.toLowerCase();
        const result = this.rawAssigned.filter(item => item.product_name.toLowerCase().includes(key));
        if (result && result.length > 0) {
            this.assigned = result;
        }

        const rsProd = this.rawProducts.filter(item => item.product_name.toLowerCase().includes(key));
        if (rsProd && rsProd.length > 0) {
            this.products = rsProd;
        }
    }
}
