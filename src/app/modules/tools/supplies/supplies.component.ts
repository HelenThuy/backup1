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
import {SuppliesService} from '../../../services/supplies.service';

@Component({
	selector: 'app-admin-tool-menu',
	templateUrl: './supplies.component.html',
	styleUrls: ['./supplies.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class SuppliesComponent implements OnInit {
    supplies: any;
    selected = [];
    SelectionType = SelectionType;
    suppliesForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    rooms: any;
    beds: any;
    curId: any;
    curIndex: any;
    isNew = true;

	constructor(private suppliesService: SuppliesService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private domSanitizer: DomSanitizer) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.getSupplies();

        this.suppliesForm = new FormGroup({
            supplies_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            supplies_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            unit: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
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
    getSupplies() {
        const params = {
            query: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            status: (this.searchForm && this.searchForm.value.status) ? this.searchForm.value.status : "",
        };

        this.suppliesService.getSupplies(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.supplies = data.results;
            } else {
                this.supplies = [];
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
            this.suppliesForm.setValue({
                supplies_name: selected.supplies_name,
                supplies_code: selected.supplies_code,
                unit: selected.unit,
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
        this.suppliesService.updateSupplies(row, row._id).subscribe(data => {
            if (data.status) {
                this.supplies[i] = row;
                this.supplies = [...this.supplies];

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
        // Object.keys(this.suppliesForm.controls).forEach(key => {
        //     this.suppliesForm.controls[key].setErrors(null)
        // });

        this.showEdit = true;
        this.isNew = true;
        this.curId = 0;
        this.suppliesForm.reset();
        this.suppliesForm.controls['status'].setValue(1);
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.suppliesForm.valid) {
            const supplies = {
                supplies_name: this.suppliesForm.value.supplies_name,
                supplies_code: this.suppliesForm.value.supplies_code,
                unit: this.suppliesForm.value.unit,
                status: parseInt(this.suppliesForm.value.status)
            };

            this.suppliesService.updateSupplies(supplies, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.supplies[this.curIndex] = supplies;
                        this.supplies[this.curIndex]._id = this.curId;
                        this.supplies = [...this.supplies];
                    } else {
                        this.getSupplies();
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
