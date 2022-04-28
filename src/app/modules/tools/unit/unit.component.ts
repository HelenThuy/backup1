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
import {UnitService} from '../../../services/unit.service';

@Component({
	selector: 'app-admin-tool-menu',
	templateUrl: './unit.component.html',
	styleUrls: ['./unit.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class UnitComponent implements OnInit {
    units: any;
    selected = [];
    SelectionType = SelectionType;
    unitForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    rooms: any;
    beds: any;
    curId: any;
    curIndex: any;
    isNew = true;

	constructor(private unitService: UnitService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private domSanitizer: DomSanitizer) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.getUnits();

        this.unitForm = new FormGroup({
            unit_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            unit_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
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
            query: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            status: (this.searchForm && this.searchForm.value.status) ? this.searchForm.value.status : "",
        };

        this.unitService.getUnits(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.units = data.results;
            } else {
                this.units = [];
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
            this.unitForm.setValue({
                unit_name: selected.unit_name,
                unit_code: selected.unit_code,
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
        this.unitService.updateUnit(row, row._id).subscribe(data => {
            if (data.status) {
                this.units[i] = row;
                this.units = [...this.units];

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
        this.unitForm.reset();
        this.unitForm.controls['status'].setValue(1);
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.unitForm.valid) {
            const unit = {
                unit_name: this.unitForm.value.unit_name,
                unit_code: this.unitForm.value.unit_code,
                unit: this.unitForm.value.unit,
                status: parseInt(this.unitForm.value.status)
            };

            this.unitService.updateUnit(unit, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.units[this.curIndex] = unit;
                        this.units[this.curIndex]._id = this.curId;
                        this.units = [...this.units];
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
