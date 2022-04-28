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
import {ReportService} from '../../../services/report.service';

@Component({
	selector: 'app-admin-tool-menu',
	templateUrl: './report-setting.component.html',
	styleUrls: ['./report-setting.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class ReportSettingComponent implements OnInit {
    reports: any;
    selected = [];
    SelectionType = SelectionType;
    reportForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    rooms: any;
    beds: any;
    curId: any;
    curIndex: any;
    isNew = true;

	constructor(private reportService: ReportService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private domSanitizer: DomSanitizer) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.getReportConfigs();

        this.reportForm = new FormGroup({
            report_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            report_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            report_value: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            report_note: new FormControl('', {updateOn: 'submit'}),
            status: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });
	}

    /**
     * lay danh sach cau hinh bao cao
     */
    getReportConfigs() {
        this.reportService.getReportConfig({}).subscribe(data => {
            if(data.status == true && data.results) {
                this.reports = data.results;
            } else {
                this.reports = [];
            }
        });
    }


    /**
     * Ham xu ly set du lieu khi select vao 1 item
     * @param selected
     */
    onSelect(selected, i) {
        this.isNew = false;
	    this.showEdit = false;

	    if (selected) {
            this.reportForm.setValue({
                report_name: selected.report_name,
                report_code: selected.report_code,
                report_value: selected.report_value,
                report_note: selected.report_note,
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
        this.reportService.updateReportConfig(row, row._id).subscribe(data => {
            if (data.status) {
                this.reports[i] = row;
                this.reports = [...this.reports];

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
        this.reportForm.reset();
        this.reportForm.controls['status'].setValue(1);
        // Object.keys(this.reportForm.controls).forEach(key => {
        //     this.reportForm.controls[key].setErrors(null)
        // });
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.reportForm.valid) {
            const branch = {
                report_name: this.reportForm.value.report_name,
                report_code: this.reportForm.value.report_code,
                report_value: this.reportForm.value.report_value,
                report_note: this.reportForm.value.report_note,
                status: parseInt(this.reportForm.value.status)
            };

            this.uiSpinnerService.spin$.next(true);
            this.reportService.updateReportConfig(branch, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.reports[this.curIndex] = branch;
                        this.reports[this.curIndex]._id = this.curId;
                        this.reports = [...this.reports];
                    } else {
                        this.getReportConfigs();
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
