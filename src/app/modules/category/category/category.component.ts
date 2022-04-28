import {Component, OnInit} from '@angular/core';
import {LocalStorage} from "@ngx-pwa/local-storage";
import {UiSpinnerService} from "../../../services/ui/ui-spinner-service";
import {MessageService} from "../../../services/message.service";
import { SelectionType } from '@swimlane/ngx-datatable';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material/core";
import * as moment from 'moment';
import {GeneralService} from "../../../services/general.service";
import {Globals} from "../../../app.globals";
import {DomSanitizer} from "@angular/platform-browser";
import {CategoryService} from '../../../services/category.service';

@Component({
	selector: 'app-admin-menu-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class CategoryComponent implements OnInit {
    categories: any;
    selected = [];
    SelectionType = SelectionType;
    categoryForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    rooms: any;
    beds: any;
    curId: any;
    curIndex: any;
    isNew = true;

	constructor(private categoryService: CategoryService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private domSanitizer: DomSanitizer) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.getCategories();

        this.categoryForm = new FormGroup({
            parent: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            category_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            category_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            status: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchForm = new FormGroup({
            keyword: new FormControl('', {updateOn: 'submit'}),
            parent: new FormControl('', {updateOn: 'submit'}),
        });
	}

    /**
     * lay danh sach dang muc
     */
    getCategories() {
        const params = {
            keyword: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            parent_id: (this.searchForm && this.searchForm.value.parent) ? this.searchForm.value.parent.category_id : "",
        };

        this.categoryService.getCategory(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.categories = data.results;
            } else {
                this.categories = [];
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
            this.categoryForm.setValue({
                parent: (selected.parent) ? selected.parent : '',
                category_name: selected.category_name,
                category_code: selected.category_code,
                status: selected.status
            });
            this.showEdit = true;
        }
        this.curId = selected._id;
        this.curIndex = i;
    }

    changeStatus(row, i) {
        this.showEdit = false;
        row.status = row.status == 1 ? 0 : 1;
        this.uiSpinnerService.spin$.next(true);
        this.categoryService.updateCategory(row, row._id).subscribe(data => {
            if (data.status) {
                this.categories[i] = row;
                this.categories = [...this.categories];

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
        this.categoryForm.reset();
        this.categoryForm.controls['status'].setValue(1);
        // Object.keys(this.categoryForm.controls).forEach(key => {
        //     this.categoryForm.controls[key].setErrors(null)
        // });
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.categoryForm.valid) {
            const branch = {
                category_name: this.categoryForm.value.category_name,
                category_code: this.categoryForm.value.category_code,
                status: parseInt(this.categoryForm.value.status),
                parent: this.categoryForm.value.parent
            };

            this.uiSpinnerService.spin$.next(true);
            this.categoryService.updateCategory(branch, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.categories[this.curIndex] = branch;
                        this.categories[this.curIndex]._id = this.curId;
                        this.categories = [...this.categories];
                    } else {
                        this.getCategories();
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
        } else {
            this.messageService.open('Vui lòng nhập đầy đủ thông tin!', 'X', 'error');
        }
    }

    compareObjects(c1:any, c2:any) {
	    return (c1 == c2)
    }

    compareCategories(c1:any, c2:any) {
        return (c1.category_id === c2.category_id)
    }
}
