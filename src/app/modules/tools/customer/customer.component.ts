import {Component, OnInit} from '@angular/core';
import {LocalStorage} from "@ngx-pwa/local-storage";
import {UiSpinnerService} from "../../../services/ui/ui-spinner-service";
import {MessageService} from "../../../services/message.service";
import { SelectionType } from '@swimlane/ngx-datatable';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material/core";
import {Globals} from "../../../app.globals";
import {GeneralService} from '../../../services/general.service';

@Component({
	selector: 'app-admin-tool-menu',
	templateUrl: './customer.component.html',
	styleUrls: ['./customer.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class CustomerComponent implements OnInit {
    customers: any;
    selected = [];
    SelectionType = SelectionType;
    customerForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    rooms: any;
    beds: any;
    curId: any;
    curIndex: any;
    isNew = true;

	constructor(private generalService: GeneralService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.getCustomers();

        this.customerForm = new FormGroup({
            customer_name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            customer_code: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            status: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchForm = new FormGroup({
            keyword: new FormControl('', {updateOn: 'submit'}),
            status: new FormControl('', {updateOn: 'submit'}),
        });
	}

    getCustomers() {
        const params = {
            key: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            status: (this.searchForm && this.searchForm.value.status) ? this.searchForm.value.status : "",
        };

        this.generalService.getCustomers(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.customers = data.results;
            } else {
                this.customers = [];
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
            this.customerForm.setValue({
                customer_name: selected.partner_customer_name,
                customer_code: selected.partner_customer_code,
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
        this.generalService.updateCustomer(row, row._id).subscribe(data => {
            if (data.status) {
                this.customers[i] = row;
                this.customers = [...this.customers];

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
        this.customerForm.reset();
        this.customerForm.controls['status'].setValue(1);
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.customerForm.valid) {
            const unit = {
                partner_customer_name: this.customerForm.value.customer_name,
                partner_customer_code: this.customerForm.value.customer_code,
                status: parseInt(this.customerForm.value.status)
            };

            this.generalService.updateCustomer(unit, this.curId).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.customers[this.curIndex] = unit;
                        this.customers[this.curIndex]._id = this.curId;
                        this.customers = [...this.customers];
                    } else {
                        this.getCustomers();
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
