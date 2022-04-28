import {Component, OnInit} from '@angular/core';
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

@Component({
	selector: 'app-admin-device',
	templateUrl: './item.component.html',
	styleUrls: ['./item.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class ItemComponent implements OnInit {
    services: any;
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

	constructor(private categoryService: CategoryService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private generalService: GeneralService) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.categoryService.getCategory({}).subscribe(data => {
            if(data.status == true && data.results) {
                this.categories = data.results;
            } else {
                this.categories = [];
            }
        });

        this.productForm = new FormGroup({
            category: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            product_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            product_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            price: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            status: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchForm = new FormGroup({
            category: new FormControl('', {updateOn: 'submit'}),
            status: new FormControl('', {updateOn: 'submit'}),
        });

        this.getItem();
	}

    /**
     * lay danh sach dich vu
     */
    getItem() {
	    const params = {
            category: (this.searchForm) ? this.searchForm.value.category : "",
            status: (this.searchForm) ? this.searchForm.value.status : "",
        };

        this.categoryService.getItem(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.services = data.results;
            } else {
                this.services = [];
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
                        category_code: selected.category_parent_code,
                        category_id: selected.category_parent_id,
                        category_name: selected.category_parent_name,
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
                this.services[i] = row;
                this.services = [...this.services];

                this.messageService.open('Chuyển trạng thái thành công', 'X', 'success');
            } else {
                this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
            }
            this.uiSpinnerService.spin$.next(false);
        });
    }

    /**
     * Ham xu ly khoi tao thong tin danh muc moi khi click button add
     */
    add() {
        this.showEdit = true;
        this.isNew = true;
        this.curId = 0;
        this.srcResult = '';
        this.srcError = '';
        this.productForm.reset();
        this.productForm.controls['status'].setValue(1);
        Object.keys(this.productForm.controls).forEach(key => {
            this.productForm.controls[key].setErrors(null)
        });
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.productForm.valid) {
            const category = {
                category_parent_name: this.productForm.value.category.parent.category_name,
                category_parent_code: this.productForm.value.category.parent.category_code,
                category_parent_id: this.productForm.value.category.parent.category_id,
                category_name: this.productForm.value.category.category_name,
                category_code: this.productForm.value.category.category_code,
                category_id: this.productForm.value.category._id,
                product_name: this.productForm.value.product_name,
                product_code: this.productForm.value.product_code,
                price: this.productForm.value.price,
                status: parseInt(this.productForm.value.status),
                image_url: (this.srcResult) ? this.srcResult : this.globals.NO_IMAGE_SERVER_URL
            };

            this.uiSpinnerService.spin$.next(true);
            this.categoryService.updateItem(category, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.services[this.curIndex] = category;
                        this.services[this.curIndex]._id = this.curId;
                        this.services = [...this.services];
                    } else {
                        this.getItem();
                        this.showEdit = false;
                    }

                    if (this.curId) {
                        this.messageService.open('Cập nhật thông tin thành công!', 'X', 'success');
                    } else {
                        this.messageService.open('Thêm mới thành công!', 'X', 'success');
                    }
                } else {
                    this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
                }
                this.uiSpinnerService.spin$.next(false);
            });
        }
    }

    compareObjects(c1:any, c2:any) {
	    return (c1 == c2)
    }

    compareCategories(c1:any, c2:any) {
	    return (c1._id === c2._id)
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
}
