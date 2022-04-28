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

@Component({
	selector: 'app-admin-tool-menu',
	templateUrl: './branch.component.html',
	styleUrls: ['./branch.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class BranchComponent implements OnInit {
    branches: any;
    selected = [];
    SelectionType = SelectionType;
    branchForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    rooms: any;
    beds: any;
    curId: any;
    curIndex: any;
    isNew = true;

	constructor(private generalService: GeneralService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private domSanitizer: DomSanitizer) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.getBranches();

        this.branchForm = new FormGroup({
            branch_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            branch_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            service: new FormControl('', {validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'submit'}),
            tax: new FormControl('', {validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'submit'}),
            status: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchForm = new FormGroup({
            keyword: new FormControl('', {updateOn: 'submit'}),
            status: new FormControl('', {updateOn: 'submit'}),
        });
	}

    /**
     * lay danh sach chi nhanh
     */
    getBranches() {
        const params = {
            query: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            status: (this.searchForm && this.searchForm.value.status) ? this.searchForm.value.status : "",
        };

        this.generalService.getBranch(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.branches = data.results;
            } else {
                this.branches = [];
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
            this.branchForm.setValue({
                branch_name: selected.branch_name,
                branch_code: selected.branch_code,
                status: selected.status,
                service: (selected.service_rate) ? selected.service_rate : 0,
                tax: (selected.tax_rate) ? selected.tax_rate : 0,
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
        this.generalService.updateBranch(row, row._id).subscribe(data => {
            if (data.status) {
                this.branches[i] = row;
                this.branches = [...this.branches];

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
        this.branchForm.reset();
        this.branchForm.controls['status'].setValue(1);
        this.branchForm.controls['service'].setValue(0);
        this.branchForm.controls['tax'].setValue(10);
        // Object.keys(this.branchForm.controls).forEach(key => {
        //     this.branchForm.controls[key].setErrors(null)
        // });
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.branchForm.valid) {
            const branch = {
                branch_name: this.branchForm.value.branch_name,
                branch_code: this.branchForm.value.branch_code,
                status: parseInt(this.branchForm.value.status),
                tax_rate: parseInt(this.branchForm.value.tax),
                service_rate: parseInt(this.branchForm.value.service)
            };

            this.uiSpinnerService.spin$.next(true);
            this.generalService.updateBranch(branch, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.branches[this.curIndex] = branch;
                        this.branches[this.curIndex]._id = this.curId;
                        this.branches = [...this.branches];
                    } else {
                        this.getBranches();
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
            if (this.branchForm.value.tax < 0 || this.branchForm.value.tax > 100 || this.branchForm.value.service < 0 || this.branchForm.value.service > 100) {
                this.messageService.open('Thuế và phí dịch vụ phải trong khoảng 0-100%', 'X', 'error');
                return false;
            }
            this.messageService.open('Vui lòng nhập đầy đủ thông tin!', 'X', 'error');
        }
    }

    compareObjects(c1:any, c2:any) {
	    return (c1 == c2)
    }
}
