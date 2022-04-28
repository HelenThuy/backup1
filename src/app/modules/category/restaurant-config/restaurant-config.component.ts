import {Component, Inject, OnInit} from '@angular/core';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {ProductService} from '../../../services/product.service';
import {CategoryService} from '../../../services/category.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GeneralService} from '../../../services/general.service';
import {ComboDialogComponent} from '../combo/combo.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Globals} from '../../../app.globals';

@Component({
    selector: 'app-restaurant-config',
    templateUrl: './restaurant-config.component.html',
    styleUrls: ['./restaurant-config.component.scss']
})
export class RestaurantConfigComponent implements OnInit {
    searchForm: FormGroup;
    products: any;
    categories: any;
    tmpCate: any;
    tmpProd: any;
    dayOfWeek: any = [
        {day_id: 1, day_name: "Thứ 2", day_code: "thu_2"},
        {day_id: 2, day_name: "Thứ 3", day_code: "thu_3"},
        {day_id: 3, day_name: "Thứ 4", day_code: "thu_4"},
        {day_id: 4, day_name: "Thứ 5", day_code: "thu_5"},
        {day_id: 5, day_name: "Thứ 6", day_code: "thu_6"},
        {day_id: 6, day_name: "Thứ 7", day_code: "thu_7"},
        {day_id: 7, day_name: "Chủ nhật", day_code: "chu_nhat"},
    ];

    menus:any;

    mealType = [
        {
            "meal_type_id": 1,
            "meal_type_code": "SANG",
            "meal_type_name": "Sáng"
        },
        {
            "meal_type_id": 2,
            "meal_type_code": "PHUSANG",
            "meal_type_name": "Phụ sáng"
        },
        {
            "meal_type_id": 3,
            "meal_type_code": "TRUA",
            "meal_type_name": "Trưa"
        },
        {
            "meal_type_id": 4,
            "meal_type_code": "PHUCHIEU",
            "meal_type_name": "Phụ chiều"
        },
        {
            "meal_type_id": 5,
            "meal_type_code": "TOI",
            "meal_type_name": "Tối"
        },
        {
            "meal_type_id": 6,
            "meal_type_code": "DEM",
            "meal_type_name": "Đêm"
        },
        {
            "meal_type_id": 7,
            "meal_type_code": "KHAC",
            "meal_type_name": "Khác"
        }
    ];

    featured = 0;

    productsOfDay: any = [];
    curCate: any;
    curProd: any;
    curId: any;
    curDay: any;
    curBranch: any;
    curMenu: any;
    curMealType: any;
    branches: any;
    showConfig = false;

    constructor(private productService: ProductService, private messageService: MessageService, public translate: TranslateService,
                private categoryService: CategoryService, private generalService: GeneralService, public dialog: MatDialog
        ) {
    }

    ngOnInit() {
        this.searchForm = new FormGroup({
            branch: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            menu: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            type: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.generalService.getBranch({status: 1}).subscribe(dataBranch => {
            if(dataBranch.status == true && dataBranch.results) {
                this.branches = dataBranch.results;
            } else {
                this.branches = [];
            }
        });

        this.categoryService.getCategory({status: 1}).subscribe(data => {
            if(data.status == true && data.results) {
                this.categories = data.results;
                this.tmpCate = data.results;
            } else {
                this.categories = [];
                this.tmpCate = [];
            }
        });

        this.categoryService.getMenuTitle({}).subscribe(data => {
            if(data.status == true && data.results) {
                this.menus = data.results;
            } else {
                this.menus = [];
            }
        });

        this.curDay = this.dayOfWeek[0];
    }

    getConfig() {
        if (this.searchForm.valid) {
            this.showConfig = true;
            this.curBranch = this.searchForm.value.branch;
            this.curMenu = this.searchForm.value.menu;
            this.curMealType = this.searchForm.value.type;
            this.getFoodByDay();
        }
    }

    getFoodByDay() {
        this.productsOfDay = [];
        this.curId = null;
        const params = {
            branch_id: this.curBranch._id,
            day_id: this.curDay.day_id,
            meal_type_id: this.curMealType.meal_type_id,
            menu_calendar_daily_id: this.curMenu._id
        }
        this.productService.getFoodByDayOfWeek(params).subscribe(data => {
            if (data.status === true && data.results[0]) {
                this.productsOfDay = data.results[0].products;
            } else {
                this.productsOfDay = [];
            }
        });
    }

    selectedDay(e) {
        this.curDay = this.dayOfWeek[e.index];
        this.getFoodByDay();
    }

    saveFoodFromDayOfWeek() {
        this.messageService.close();
        if (this.curProd) {
            const result = this.productsOfDay.filter(item => item.product_name.toLowerCase().includes(this.curProd.product_name.toLowerCase()));

            if (result && result.length > 0) {
                this.messageService.open('Sản phẩm bạn chọn đã có trong danh sách', 'x', 'warning');
                return;
            }
            this.curProd.featured = (this.featured) ? 1 : 0;
            this.productsOfDay.push(this.curProd);

            if (this.productsOfDay.length > 0) {
                this.saveFood();
            }

            // this.curProd = null;
            // this.curCate = null;
            // this.products = [];
            // this.tmpProd = [];
            return;
        } else {
            this.messageService.open('Vui lòng chọn sản phẩm', 'x', 'warning');
            return;
        }
    }

    saveFood() {
        const params = {
            calendar_daily_id: this.curDay.day_id,
            calendar_daily_code: this.curDay.day_code,
            calendar_daily_name: this.curDay.day_name,
            branch_id: this.curBranch._id,
            branch_code: this.curBranch.branch_code,
            branch_name: this.curBranch.branch_name,
            products: this.productsOfDay,
            meal_type_code: this.curMealType.meal_type_code,
            meal_type_id: this.curMealType.meal_type_id,
            meal_type_name: this.curMealType.meal_type_name,
            menu_calendar_daily_code: this.curMenu.menu_calendar_daily_code,
            menu_calendar_daily_id: this.curMenu._id,
            menu_calendar_daily_name: this.curMenu.menu_calendar_daily_name,
        }

        this.productService.saveFoodFromDayOfWeek(this.curId, params).subscribe(data => {
            if (data.status === true) {
                this.productsOfDay = [...this.productsOfDay];
                this.curId = data.results;
                this.messageService.open('Lưu cấu hình thành công', 'x', 'success');
            } else {
                this.messageService.open('Có lỗi trong quá trình cập nhật', 'x', 'error');
            }
        });
    }



    delete(i) {
        if (confirm("Bạn có chắc chắn muốn bỏ món này không?")) {
            this.productsOfDay.splice(i, 1);
            this.saveFood();
        }
    }

    edit(row, i) {
        const dialogRef = this.dialog.open(AddItemDialogComponent, {
            width: '555px',
            data: {
                categories: this.categories,
                tmpCate: this.tmpCate,
                curBranch: this.curBranch,
                productsOfDay: this.productsOfDay,
                edit: row,
                editIndex: i
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.products) {
                if (result && result.products) {
                    this.productsOfDay = result.products;
                    this.saveFood();
                }
            }
        });
    }

    openForm() {
        const dialogRef = this.dialog.open(AddItemDialogComponent, {
            width: '555px',
            data: {
                categories: this.categories,
                tmpCate: this.tmpCate,
                curBranch: this.curBranch,
                productsOfDay: this.productsOfDay,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.products) {
                this.productsOfDay = result.products;
                this.saveFood();
            }
        });
    }
}




//TODO: popup import data
@Component({
    selector: 'add-item-dialog',
    templateUrl: 'add-item-dialog.component.html',
    styleUrls: ['./restaurant-config.component.scss'],
})
export class AddItemDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<AddItemDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public globals: Globals,
        private categoryService: CategoryService,
        private messageService: MessageService
    ) {
    }
    categories:any;
    tmpCate:any;
    curCate:any;
    products:any;
    tmpProd:any;
    curProd:any;
    curBranch:any;
    curSet:any;
    curOption:any;
    productsOfDay:any;
    featured = 0;

    categoriesDaily = [
        {
            "_id": "60c07e497aadb219f0a0bad1",
            "category_daily_code": "rau",
            "category_daily_name": "Rau",
            "created_at": "1623227734",
            "created_by": "hoaint"
        },
        {
            "_id": "60c07e427aadb219f0a0bad0",
            "category_daily_code": "canh",
            "category_daily_name": "Canh",
            "created_at": "1623227734",
            "created_by": "hoaint"
        },
        {
            "_id": "60c07e357aadb219f0a0bacf",
            "category_daily_code": "thit",
            "category_daily_name": "Thịt",
            "created_at": "1623227734",
            "created_by": "hoaint"
        }
    ];
    categoriesParentDaily = [
        {
            category_daily_parent_id: "60c07da27aadb219f0a0bace",
            category_daily_parent_code: "mon_chinh",
            category_daily_parent_name: "Món chính"
        },
        {
            category_daily_parent_id: "60c07d867aadb219f0a0bacd",
            category_daily_parent_code: "set_com",
            category_daily_parent_name: "Set Cơm"
        },
    ];
    isNew = true;
    curProdName = "";
    curProdCode = "";
    curProdPrice = 0;
    editData: any;
    editIndex: -1;

    ngOnInit() {
        this.categories = this.data.categories;
        this.tmpCate = this.data.tmpCate;
        this.curBranch = this.data.curBranch;
        this.productsOfDay = this.data.productsOfDay;
        if (this.data.edit) {
            this.editData = this.data.edit;
            this.editIndex = this.data.editIndex;
            this.isNew = false;
            this.featured = this.data.edit.featured;
            this.curSet = {
                    category_daily_parent_id: this.data.edit.category_daily_parent_id,
                    category_daily_parent_code: this.data.edit.category_daily_parent_code,
                    category_daily_parent_name: this.data.edit.category_daily_parent_name
                };
            this.curOption = {
                    "_id": this.data.edit.category_daily_id,
                    "category_daily_code": this.data.edit.category_daily_code,
                    "category_daily_name": this.data.edit.category_daily_name,
                }
            this.curProdName = this.data.edit.product_name;
            this.curProdCode = this.data.edit.product_code;
            this.curProdPrice = this.data.edit.price;
        }
    }

    save() {
        this.messageService.close();
        if (this.curProd) {
            const result = this.productsOfDay.filter(item => item.product_name.toLowerCase().includes(this.curProd.product_name.toLowerCase()));

            if (result && result.length > 0) {
                this.messageService.open('Sản phẩm bạn chọn đã có trong danh sách', 'x', 'warning');
                return;
            }
            this.curProd.featured = (this.featured) ? 1 : 0;
            // this.curProd
            this.curProd.category_daily_code = (this.curOption) ? this.curOption.category_daily_code : "";
            this.curProd.category_daily_id = (this.curOption) ? this.curOption._id : "";
            this.curProd.category_daily_name = (this.curOption) ? this.curOption.category_daily_name : "";
            this.curProd.category_daily_parent_code = (this.curSet) ? this.curSet.category_daily_parent_code : "";
            this.curProd.category_daily_parent_id = (this.curSet) ? this.curSet.category_daily_parent_id : "";
            this.curProd.category_daily_parent_name = (this.curSet) ? this.curSet.category_daily_parent_name : "";
            this.productsOfDay.push(this.curProd);

            if (this.productsOfDay.length > 0) {
                this.dialogRef.close({
                    products: this.productsOfDay,
                });
            }
            return;
        } else {
            this.messageService.open('Vui lòng chọn sản phẩm', 'x', 'warning');
            return;
        }
    }

    update() {
        if (this.editData && this.editIndex >= 0) {
            this.editData.category_daily_parent_id = (this.curSet) ? this.curSet.category_daily_parent_id : "";
            this.editData.category_daily_parent_code = (this.curSet) ? this.curSet.category_daily_parent_code : "";
            this.editData.category_daily_parent_name = (this.curSet) ? this.curSet.category_daily_parent_name : "";

            this.editData.category_daily_id = (this.curOption) ? this.curOption._id : "";
            this.editData.category_daily_code = (this.curOption) ? this.curOption.category_daily_code : "";
            this.editData.category_daily_name = (this.curOption) ? this.curOption.category_daily_name : "";

            this.editData.featured = (this.featured) ? 1 : 0;
            this.editData.price = this.curProdPrice;

            this.productsOfDay[this.editIndex] = this.editData;

            this.dialogRef.close({
                products: this.productsOfDay,
            });
        }
    }

    getProduct(key = '', alert = true) {
        this.messageService.close();
        const params = {
            branch_id: this.curBranch._id,
            query: key
        };

        this.categoryService.getItemByCategory(this.curCate._id, params).subscribe(data => {
            if(data.status == true && data.results) {
                this.products = data.results;
                this.tmpProd = data.results;
            } else {
                this.products = [];
                this.tmpProd = [];
                if (alert) {
                    this.messageService.open('Danh mục bạn chọn không có sản phẩm nào!', 'X', 'error');
                }
            }
        });
    }

    selectCate(e) {
        this.curProd = null;
        if (e.value) {
            this.getProduct();
        } else {
            this.curCate = null
        }
    }

    searchCate(val) {
        if (val.length > 0) {
            const filterValue = val.toLowerCase();
            const result = this.categories.filter(item => item.category_name.toLowerCase().includes(filterValue));

            if (result && result.length > 0) {
                this.tmpCate = result;
            }
        }
    }

    searchProduct(val) {
        this.getProduct(val, false);
    }

    compareOption(c1:any, c2:any) {
        return (c1._id == c2._id);
    }

    compareSet(c1:any, c2:any) {
        return (c1.category_daily_parent_id == c2.category_daily_parent_id);
    }
}
