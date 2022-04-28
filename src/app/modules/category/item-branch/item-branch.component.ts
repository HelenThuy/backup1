import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {LocalStorage} from "@ngx-pwa/local-storage";
import {UiSpinnerService} from "../../../services/ui/ui-spinner-service";
import {MessageService} from "../../../services/message.service";
import { SelectionType } from '@swimlane/ngx-datatable';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material/core";
import * as moment from 'moment';
import {CategoryService} from '../../../services/category.service';
import {Globals} from '../../../app.globals';
import {GeneralService} from '../../../services/general.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import 'rxjs-compat/add/operator/startWith';
import 'rxjs-compat/add/operator/debounceTime';
import 'rxjs-compat/add/operator/do';
import {SuppliesService} from '../../../services/supplies.service';
import {UnitService} from '../../../services/unit.service';
import {ExcelService} from '../../../services/excel.service';
import {ComboDialogComponent, EditDialogComponent} from '../combo/combo.component';

@Component({
	selector: 'app-admin-combo',
	templateUrl: './item-branch.component.html',
	styleUrls: ['./item-branch.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class ItemBranchComponent implements OnInit {
    // @ts-ignore
    @ViewChild('myTable', { static: false }) table: any;
    products: any;
    combos: any;
    selected = [];
    SelectionType = SelectionType;
    productForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    categories: any;
    curId: any;
    curIndex: any;
    isNew = true;
    srcResult: any = '';
    srcError: any = '';
    supplies = null;
    units = null;
    checked = [];
    curBranch: any;
    pageLimitOptions = [
        {value: '20'},
        {value: '50'},
        {value: '100'}
    ];
    currentPageLimit = '20';

	constructor(private categoryService: CategoryService, private messageService: MessageService, public globals: Globals, public dialog: MatDialog,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private suppliesService: SuppliesService,
                private unitService: UnitService) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.localStorage.getItem('setting').subscribe((data) => {
            this.curBranch = data.branch;
            this.getItem();
        });

        this.searchForm = new FormGroup({
            keyword: new FormControl('', {updateOn: 'submit'}),
            category: new FormControl('', {updateOn: 'submit'}),
            status: new FormControl('', {updateOn: 'submit'}),
        });

        //TODO: lay danh sach cateogory
        this.categoryService.getCategory({}).subscribe(data => {
            if(data.status == true && data.results) {
                this.categories = data.results;
            } else {
                this.categories = [];
            }
        });

        //TODO: lay danh sach vat tu
        this.suppliesService.getSupplies({status: 1}).subscribe(data => {
            if (data.status == true && data.results) {
                this.supplies = data.results;
            } else {
                this.supplies = [];
            }
        });

        //TODO: lay danh sach don vi tinh san pham
        this.unitService.getUnits({status: 1}).subscribe(data => {
            if (data.status == true && data.results) {
                this.units = data.results;
            } else {
                this.units = [];
            }
        });
	}

    /**
     * lay danh sach dich vu
     */
    getItem(n = 10, p = 1) {
        this.checked = [];
	    const params = {
            keyword: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            category: (this.searchForm && this.searchForm.value.category ) ? this.searchForm.value.category : "",
            status: (this.searchForm && this.searchForm.value.status) ? this.searchForm.value.status : "",
            // n: n,
            // p: p
        };

        this.categoryService.getProductInBranch(this.curBranch.branch_id, params).subscribe(data => {
            if(data.status == true && data.results) {
                this.products = data.results;
            } else {
                this.products = [];
            }
        });
    }

    /**
     * Ham xu ly set du lieu khi select vao 1 device
     * @param selected
     */
    onSelect(selected, i) {
        this.isNew = false;
	    this.showEdit = false;
	    if (selected) {
            this.productForm.setValue({
                category: {
                    _id: selected.category_id,
                    category_name: selected.category_name,
                    category_code: selected.category_code,
                    parent: {
                        category_parent_code: selected.category_parent_code,
                        category_parent_id: selected.category_parent_id,
                        category_parent_name: selected.category_parent_name,
                    }
                },
                product_name: selected.product_name,
                product_code: selected.product_code,
                price: selected.price,
                status: selected.status
            });
            this.srcResult = selected.image_url;
            this.showEdit = true;
        }
        this.curId = selected._id;
        this.curIndex = i;
    }

    changeStatus(row, i) {
        this.showEdit = false;
        row.status = row.status == 1 ? 0 : 1;
        this.uiSpinnerService.spin$.next(true);
        this.categoryService.updateItem(row, row._id).subscribe(data => {
            if (data.status) {
                this.products[i] = row;
                this.products = [...this.products];

                this.messageService.open('Chuyển trạng thái thành công', 'X', 'success');
            } else {
                this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
            }
            this.uiSpinnerService.spin$.next(false);
        });
    }

    onCheck(checked) {
        this.checked = [];
        this.checked.push(...checked.selected);
    }

    openEditMulti() {
        const dialogRef = this.dialog.open(EditItemDialogComponent, {
            width: '1024px',
            data: {
                categories: this.categories,
                units: this.units,
                products: this.checked,
                branch: this.curBranch
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.status) {
                this.messageService.open('Cập nhật dữ liệu thành công!', 'X', 'success');
                this.getItem();
            }
        });
    }

    openEdit(row = null, i = null) {
        let data = {
            product: {
                _id: '',
                category: null,
                unit: null,
                product_name: '',
                product_code: '',
                image_url: '',
                price: '',
                status: "1",
                combo: [],
                supplies: []
            },
            items: this.products,
            categories: this.categories,
            supplies: this.supplies,
            units: this.units,
            branch: this.curBranch
        };

        if (row) {
            let productData = Object.create(row);
            // todo: set data combo de edit
            if (productData.combo) {
                let products = [];
                productData.combo.forEach((product, key) => {
                    let ele = {
                        name: product,
                        price: product.price,
                        lists: this.products
                    }
                    products.push(ele);
                });

                productData.combo = products;
            } else {
                productData.combo = []
            }

            // todo: set data vat tu de edit
            if (productData.supplies) {
                let supplies = [];
                productData.supplies.forEach((supp, key) => {
                    let ele = {
                        name: supp,
                        value: supp.value,
                        lists: this.supplies
                    }
                    supplies.push(ele);
                });

                productData.supplies = supplies;
            } else {
                productData.supplies = []
            }

            productData.status = productData.status + "";

            data.product = {
                _id: productData._id,
                category: {
                    _id: productData.category_id,
                    category_name: productData.category_name,
                    category_code: productData.category_code,
                    category_status: productData.category_status,
                    parent: {
                        category_code: productData.category_parent_code,
                        category_id: productData.category_parent_id,
                        category_name: productData.category_parent_name,
                    }
                },
                unit: {
                    _id: productData.unit_id,
                    unit_name: productData.unit_name,
                    unit_code: productData.unit_code,
                    unit_status: productData.unit_status,
                },
                product_name: productData.product_name,
                product_code: productData.product_code,
                image_url: productData.image_url,
                price: productData.price,
                status: productData.status + "",
                combo: productData.combo,
                supplies: productData.supplies
            };
        }

        const dialogRef = this.dialog.open(UpdateDialogComponent, {
            width: '777px',
            data: data,
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.status) {
                if (result.curId) {
                    this.messageService.open('Cập nhật thông tin thành công!', 'X', 'success');
                } else {
                    this.messageService.open('Thêm mới thành công!', 'X', 'success');
                }
                this.getItem();
            }
        });
    }

    setPage(e) {
        this.table.offset = e.offset;
        this.table.limit = parseInt(e.limit);
    }
}

@Component({
    selector: 'edit-item-dialog',
    templateUrl: 'edit-item-dialog.component.html',
    styleUrls: ['./item-branch.component.scss'],
})
export class EditItemDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<EditItemDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public globals: Globals,
        private categoryService: CategoryService,
        private messageService: MessageService
    ) {
    }

    products:any;
    categories:any;
    units:any;
    status = [
        {status_id: 0, status_name: 'Không kích hoạt'},
        {status_id: 1, status_name: 'Kích hoạt'}
    ]
    curBranch: any;
    ngOnInit() {
        this.products = this.data.products;
        this.units = this.data.units;
        this.categories = this.data.categories;
        this.curBranch = this.data.branch;
    }

    save() {
        const params = {
            products: this.products
        }

        this.categoryService.updateManyItemBranch(this.curBranch, params).subscribe(data => {
            if (data.status) {
                this.dialogRef.close(data);
            } else {
                this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
            }
        });
    }

    changeUnit(val, i) {
        this.products[i].unit_id = val._id;
        this.products[i].unit_code = val.unit_code;
        this.products[i].unit_name = val.unit_name;
        this.products[i].unit_status = val.status;
    }

    changeCategory(val, i) {
        this.products[i].category_id = val._id;
        this.products[i].category_code = val.category_code;
        this.products[i].category_name = val.category_name;
        this.products[i].category_status = val.status;
        this.products[i].category_parent_code = val.parent.category_code;
        this.products[i].category_parent_id = val.parent.category_id;
        this.products[i].category_parent_name = val.parent.category_name;
    }

    compareObjects(c1:any, c2:any) {
        return (c1._id == c2)
    }

    compareCategory(c1:any, c2:any) {
        return (c1._id == c2)
    }
}

// todo: popup edit product
@Component({
    selector: 'update-dialog',
    templateUrl: 'update-dialog.component.html',
    styleUrls: ['./item-branch.component.scss'],
})
export class UpdateDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<UpdateDialogComponent>,
        private categoryService: CategoryService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public globals: Globals,
        private generalService: GeneralService,
        private messageService: MessageService
    ) {}

    searchCtrl = new FormControl('');
    item: any;
    listItem: any;
    listSupp: any;
    listUnit: any;
    doCheck = false;
    error = '';
    srcResult: any = '';
    srcError: any = '';
    categories: any;
    curBranch: any;

    ngOnInit() {
        this.item = this.data.product;
        this.listItem = this.data.items;
        this.listSupp = this.data.supplies;
        this.listUnit = this.data.units;
        this.categories = this.data.categories;
        this.doCheck = false;
        this.srcResult = this.data.product.image_url;
        this.curBranch = this.data.branch;
    }

    removeInput(index) {
        this.item.combo.splice(index,1)
    }

    addInput() {
        this.item.combo.push({name: '',price: 0, lists: this.listItem.slice(0,10)})
    }

    addSupInput() {
        this.item.supplies.push({name: '',value: 0, lists: this.listSupp.slice(0,10)})
    }

    removeSupInput(index) {
        this.item.supplies.splice(index,1)
    }

    search(val, i) {
        if (val.length > 0) {
            const filterValue = val.toLowerCase();
            const result = this.data.items.filter(item => item.product_name.toLowerCase().includes(filterValue));
            if (result && result.length > 0) {
                this.item.combo[i].lists = result;
            }
        }
    }

    searchSup(val, i) {
        if (val.length > 0) {
            const filterValue = val.toLowerCase();
            const result = this.data.supplies.filter(item => item.supplies_name.toLowerCase().includes(filterValue));

            if (result && result.length > 0) {
                this.item.supplies[i].lists = result;
            }
        }
    }

    searchCate(val) {
        if (val.length > 0) {
            const filterValue = val.toLowerCase();
            const result = this.data.categories.filter(item => item.category_name.toLowerCase().includes(filterValue));

            if (result && result.length > 0) {
                this.categories = result;
            }
        }
    }

    save() {
        this.error = '';
        this.doCheck = true;
        let products = [];
        let supplies = [];

        this.item.combo.forEach((value, key) => {
            if (value.name) {
                value.name.price = value.price;
                value.name.combo = null;
                // const product: Product = value.name;
                // console.log("product",product);
                products.push(value.name);
            }
        })

        this.item.supplies.forEach((value, key) => {
            if (value.name) {
                value.name.value = value.value;
                // const product: Product = value.name;
                // console.log("product",product);
                supplies.push(value.name);
            }
        })

        // if (products.length <= 0) {
        //     this.error = 'Vui lòng nhập thông tin sản phẩm!';
        //     return;
        // }

        if (this.item.category == null || this.item.product_name == "" || this.item.product_code == "" || parseInt(this.item.price) < 0) {
            return false;
        }

        const data = {
            _id: this.item._id,
            category_parent_name: this.item.category.parent.category_name,
            category_parent_code: this.item.category.parent.category_code,
            category_parent_id: this.item.category.parent.category_id,
            category_name: this.item.category.category_name,
            category_code: this.item.category.category_code,
            category_status: (this.item.category.status) ? this.item.category.status : this.item.category.category_status,
            category_id: this.item.category._id,
            product_name: this.item.product_name,
            product_code: this.item.product_code,
            price: this.item.price,
            status: parseInt(this.item.status),
            combo: ((products.length <= 0)) ? null : products,
            supplies: ((supplies.length <= 0)) ? null : supplies,
            image_url: (this.srcResult) ? this.srcResult : this.globals.NO_IMAGE_SERVER_URL,
            unit_id: this.item.unit._id,
            unit_name: this.item.unit.unit_name,
            unit_code: this.item.unit.unit_code,
            unit_status: this.item.unit.status,
        }

        this.categoryService.updateItemBranch(this.curBranch.branch_id, data).subscribe(data => {
            if (data.status) {
                data['curId'] = this.item._id;
                this.dialogRef.close(data);
            } else {
                this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
            }
        });
    }

    onFileSelected() {
        const inputNode: any = document.querySelector('#file');
        this.srcError = '';
        if ((inputNode.files[0] && inputNode.files[0]['type'].split('/')[0] === 'image')) {
            const formData = new FormData();
            formData.append('file', inputNode.files[0]);

            this.generalService.uploadFile(formData).subscribe((res) => {
                if (res.status == true && res.results) {
                    this.srcResult = res.results;
                } else {
                    this.srcError = 'Có lỗi xảy ra trong quá trình đăng ảnh!!!';
                }
            });
        } else {
            this.srcError = 'Vui lòng chọn đúng file ảnh!!!';
        }
    }

    compareObjects(c1:any, c2:any) {
        return (c1._id == c2._id)
    }

    compareSuppObjects(c1:any, c2:any) {
        return (c1._id == c2._id)
    }

    compareCategories(c1:any, c2:any) {
        return (c1._id === c2._id)
    }

    compareUnit(c1:any, c2:any) {
        return (c1._id === c2._id)
    }
}

