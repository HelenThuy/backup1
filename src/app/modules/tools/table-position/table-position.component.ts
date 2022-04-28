import {Component, OnInit} from '@angular/core';
import {LocalStorage} from "@ngx-pwa/local-storage";
import {UiSpinnerService} from "../../../services/ui/ui-spinner-service";
import {MessageService} from "../../../services/message.service";
import { SelectionType } from '@swimlane/ngx-datatable';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material/core";
import * as moment from 'moment';
import {Globals} from "../../../app.globals";
import {DomSanitizer} from "@angular/platform-browser";
import {TableService} from '../../../services/table.service';

@Component({
	selector: 'app-admin-tool-menu',
	templateUrl: './table-position.component.html',
	styleUrls: ['./table-position.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class TablePositionComponent implements OnInit {
    positions: any;
    selected = [];
    SelectionType = SelectionType;
    positionForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    curId: any;
    curIndex: any;
    curBranch: any;
    isNew = true;

	constructor(private tableService: TableService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private domSanitizer: DomSanitizer) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.localStorage.getItem('setting').subscribe(data => {
            this.curBranch = data.branch;
            this.getUnits();
        });

        this.positionForm = new FormGroup({
            position_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            position_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
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
    getUnits() {
        const params = {
            branch_id: this.curBranch.branch_id,
            query: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            status: (this.searchForm && this.searchForm.value.status) ? this.searchForm.value.status : "",
        };

        this.tableService.getPositions(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.positions = data.results;
            } else {
                this.positions = [];
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
            this.positionForm.setValue({
                position_name: selected.position_name,
                position_code: selected.position_code,
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
        this.tableService.updatePosition(row, row._id).subscribe(data => {
            if (data.status) {
                this.positions[i] = row;
                this.positions = [...this.positions];

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
        // Object.keys(this.positionForm.controls).forEach(key => {
        //     this.positionForm.controls[key].setErrors(null)
        // });

        this.showEdit = true;
        this.isNew = true;
        this.curId = 0;
        this.positionForm.reset();
        this.positionForm.controls['status'].setValue(1);
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.positionForm.valid) {
            const unit = {
                branch_id: this.curBranch.branch_id,
                branch_code: this.curBranch.branch_code,
                branch_name: this.curBranch.branch_name,
                position_name: this.positionForm.value.position_name,
                position_code: this.positionForm.value.position_code,
                status: parseInt(this.positionForm.value.status)
            };

            this.tableService.updatePosition(unit, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.positions[this.curIndex] = unit;
                        this.positions[this.curIndex]._id = this.curId;
                        this.positions = [...this.positions];
                    } else {
                        this.getUnits();
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
}
