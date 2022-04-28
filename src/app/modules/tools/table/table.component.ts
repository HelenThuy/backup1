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
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class TableComponent implements OnInit {
    tables: any;
    selected = [];
    SelectionType = SelectionType;
    tableForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    curId: any;
    curIndex: any;
    isNew = true;
    positions: any;
    curBranch: any;

	constructor(private tableService: TableService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private domSanitizer: DomSanitizer) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.localStorage.getItem('setting').subscribe(data => {
            this.curBranch = data.branch;
            this.getTables();

            this.tableService.getPositions({branch_id: data.branch.branch_id}).subscribe(data => {
                if(data.status == true && data.results) {
                    this.positions = data.results;
                } else {
                    this.positions = [];
                }
            });
        });

        this.tableForm = new FormGroup({
            position: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            table_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            table_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            status: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchForm = new FormGroup({
            position: new FormControl('', {updateOn: 'submit'}),
            keyword: new FormControl('', {updateOn: 'submit'}),
            status: new FormControl('', {updateOn: 'submit'}),
        });
	}

    /**
     * lay danh sach chi nhanh
     */
    getTables() {
        const params = {
            query: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            status: (this.searchForm && this.searchForm.value.status) ? this.searchForm.value.status : "",
            position_id: (this.searchForm && this.searchForm.value.position) ? this.searchForm.value.position : "",
            branch_id: (this.curBranch && this.curBranch.branch_id) ? this.curBranch.branch_id : "",
        };

        this.tableService.getTables(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.tables = data.results;
            } else {
                this.tables = [];
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
            this.tableForm.setValue({
                position: selected.position,
                table_name: selected.table_name,
                table_code: selected.table_code,
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
        this.tableService.updateTable(row, row._id).subscribe(data => {
            if (data.status) {
                this.tables[i] = row;
                this.tables = [...this.tables];

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
        // Object.keys(this.unitForm.controls).forEach(key => {
        //     this.unitForm.controls[key].setErrors(null)
        // });

        this.showEdit = true;
        this.isNew = true;
        this.curId = 0;
        this.tableForm.reset();
        this.tableForm.controls['status'].setValue(1);
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.tableForm.valid) {
            console.log(this.tableForm.value.position);
            const table = {
                position: this.tableForm.value.position,
                table_name: this.tableForm.value.table_name,
                table_code: this.tableForm.value.table_code,
                status: parseInt(this.tableForm.value.status)
            };

            this.tableService.updateTable(table, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.tables[this.curIndex] = table;
                        this.tables[this.curIndex]._id = this.curId;
                        this.tables = [...this.tables];
                    } else {
                        this.getTables();
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
	    return (c1._id == c2._id)
    }

    compareStatus(c1:any, c2:any) {
        return (c1 == c2)
    }
}
