import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {LocalStorage} from "@ngx-pwa/local-storage";
import {UiSpinnerService} from "../../../services/ui/ui-spinner-service";
import {MessageService} from "../../../services/message.service";
import { SelectionType } from '@swimlane/ngx-datatable';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import {GeneralService} from "../../../services/general.service";
import {Globals} from "../../../app.globals";
import {DomSanitizer} from "@angular/platform-browser";
import {CategoryService} from '../../../services/category.service';
import {PosService} from '../../../services/pos.service';
import {ActivatedRoute, Router} from '@angular/router';
import { Location } from "@angular/common";
import {PaymentDialogComponent} from '../pos/pos.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {interval} from 'rxjs';
import {ConfirmDialogComponent} from '../../../core/confirm-dialog/confirm-dialog.component';
import {ReportService} from '../../../services/report.service';

@Component({
	selector: 'app-admin-order-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class HistoryComponent implements OnInit {
    // @ts-ignore
    @ViewChild('myTable', { static: false }) table: any;
    curRow = -1;
    categories: any;
    selected = [];
    SelectionType = SelectionType;
    searchForm: FormGroup;
    searchOrderForm: FormGroup;
    showEdit = false;
    curId: any;
    curIndex: any;
    isNew = true;
    curRole: any;
    branches: any;
    showBranch: boolean = false;
    orders: any;
    detail: any;
    hisCount: any;
    minTo: any;
    maxFrom: any;
    curBranch: any;
    mealType = [
        {
            "meal_type_id": 1,
            "meal_type_code": "SANG",
            "meal_type_name": "Sáng"
        },
        {
            "meal_type_id": 2,
            "meal_type_code": "PHUSANG",
            "meal_type_name": "Phụ sáng"
        },
        {
            "meal_type_id": 3,
            "meal_type_code": "TRUA",
            "meal_type_name": "Trưa"
        },
        {
            "meal_type_id": 4,
            "meal_type_code": "PHUCHIEU",
            "meal_type_name": "Phụ chiều"
        },
        {
            "meal_type_id": 5,
            "meal_type_code": "TOI",
            "meal_type_name": "Tối"
        },
        {
            "meal_type_id": 6,
            "meal_type_code": "DEM",
            "meal_type_name": "Đêm"
        },
        {
            "meal_type_id": 7,
            "meal_type_code": "KHAC",
            "meal_type_name": "Khác"
        }
    ];

    pageLimitOptions = [
        {value: '20'},
        {value: '50'},
        {value: '100'}
    ];
    currentPageLimit = '20';
    curStatus = "";
    showNoti = true;
    timer: any;

    constructor(private generalService: GeneralService, private messageService: MessageService, public globals: Globals, private posService: PosService,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private activatedRoute:ActivatedRoute,
                public dialog: MatDialog, private reportService: ReportService) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.searchForm = new FormGroup({
            branch: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchOrderForm = new FormGroup({
            from: new FormControl('', {updateOn: 'submit'}),
            to: new FormControl('', {updateOn: 'submit'}),
            meal_type: new FormControl('', {updateOn: 'submit'}),
            receipt: new FormControl('', {updateOn: 'submit'}),
        });

        this.localStorage.getItem('setting').subscribe((data) => {
            this.curRole = data.role;
            if (data.role.role_id != 1 && data.role.role_id != 2) {
                // todo: role nhan vien -> set mac dinh chi nhanh
                this.searchForm.setValue({
                    branch: data.branch
                });

                this.changeBranch();
            } else {
                // todo: role admin/quan ly -> cho chon chi nhanh
                this.generalService.getBranch({status: 1}).subscribe(dataBranch => {
                    if (dataBranch.status == true && dataBranch.results) {
                        this.branches = dataBranch.results;

                        this.searchForm.setValue({
                            branch: data.branch
                        });
                        this.changeBranch();
                    } else {
                        this.branches = [];
                    }
                });

                this.showBranch = true;
            }
        });

        this.timer = setInterval(() => {
            this.notiNewOrder();
        }, 60000*3);
	}

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    notiNewOrder() {
        if (this.showNoti) {
            const params = {
                branch_id: (this.searchForm && this.searchForm.value.branch.branch_id) ? this.searchForm.value.branch.branch_id : this.searchForm.value.branch._id,
                n: 1,
                p: 1,
                order_type: "DOANNHAHANG,RESTAURANT",
                status: 'BOOKED',
                from: moment().startOf('day').unix(),
                to: moment().endOf('day').unix(),
                time: 'used_at',
            }

            this.posService.history(params).subscribe(data => {
                if (data.status && data.results && data.count > 0) {
                    this.showNoti = false;
                    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                        data: {
                            message: 'Có ' + data.count + ' order mới cần xử lý, bạn có muốn xử lý không?',
                            buttonText: {
                                ok: 'Xử lý',
                                cancel: 'Bỏ qua'
                            }
                        }
                    });

                    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
                        this.showNoti = true;
                        if (confirmed) {
                            this.curStatus = 'BOOKED';
                            this.changeBranch();
                        }
                    });
                }
            });

        }
    }

    changeBranch() {
        if (this.searchForm) {
            this.curBranch = this.searchForm.value.branch;
        }

        this.searchOrderForm.setValue({
            from: new Date(),
            to: new Date(),
            meal_type: "",
            receipt: "",
        });

        this.getOrders();
    }

	getOrders(n = this.currentPageLimit, p= 1) {
        const params = {
            branch_id: (this.searchForm && this.searchForm.value.branch.branch_id) ? this.searchForm.value.branch.branch_id : this.searchForm.value.branch._id,
            n: n,
            p: p,
            status: this.curStatus,
            order_type: "DOANNHAHANG,RESTAURANT",
            from: (this.searchOrderForm && this.searchOrderForm.value.from) ? moment(this.searchOrderForm.value.from).startOf('day').add(1, 'second').unix() : '',
            to: (this.searchOrderForm && this.searchOrderForm.value.to) ? moment(this.searchOrderForm.value.to).endOf('day').unix() : '',
            receipt_id: (this.searchOrderForm && this.searchOrderForm.value.receipt) ? this.searchOrderForm.value.receipt : '',
            meal_type: (this.searchOrderForm && this.searchOrderForm.value.meal_type) ? this.searchOrderForm.value.meal_type.meal_type_id : '',
            time: 'created_at'
        }

        this.posService.history(params).subscribe(data => {
            if (data.status && data.results) {
                this.orders = data.results;
                this.hisCount = data.count;
            } else {
                this.orders = [];
                this.hisCount = 0;
            }
        });
    }

    compareObjects(c1:any, c2:any) {
	    return (c1.branch_code == c2.branch_code)
    }

    toggleExpandRow(row, rowIndex) {
        this.table.rowDetail.collapseAllRows();
        this.detail = row.products;
        if (this.curRow != rowIndex) {
            this.curRow = rowIndex;
            this.table.rowDetail.toggleExpandRow(row, rowIndex);
        } else {
            this.curRow = -1;
        }
    }

    changePageLimit(e, p) {
        this.getOrders(e, p);
    }

    pageCallback(e) {
	    this.getOrders(e.limit, (e.offset + 1));
    }

    selectStatus(row, e) {
        if (e == 'CANCEL') {
            this.openConfirmCancel(row, e);
        } else {
            this.changeStatus(row,e);
        }
    }

    changeStatus(row, e, note = '') {
        const params = {
            "patient_id": row.patient_id,
            "reservation_id": row.reservation_id,
            "status": e,
            "table_id": row.table,
            "note": note
        };

        this.posService.changeStatus(params, row._id).subscribe(data => {
            if (data.status && data.results) {
                this.getOrders();
                this.messageService.open('Chuyển trạng thái thành công', 'X', 'success');
            } else {
                this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
            }
        });
    }

    openNoteEdit(row, i) {
        const dialogRef = this.dialog.open(NoteCancelDialogComponent, {
            width: '650px',
            data: {

            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.note) {
                console.log(result.note);
            }
        });
    }

    openConfirmCancel(row, e) {
        const dialogRef = this.dialog.open(NoteCancelDialogComponent, {
            width: '650px',
            data: {
                title: "Ghi chú"
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.note) {
                this.changeStatus(row, e, result.note)
            }
        });
    }

    checkAll(e) {
	    if (confirm("Bạn có chắc chắn muốn duyệt tất cả đơn hàng BOOKED sang CHECKIN?")) {
            const params = {
                branch_id: (this.searchForm && this.searchForm.value.branch.branch_id) ? this.searchForm.value.branch.branch_id : this.searchForm.value.branch._id,
                from: 'BOOKED',
                to: 'CHECKIN'
            };

            this.posService.changeStatusAll(params).subscribe(data => {
                if (data.status && data.results) {
                    this.getOrders();
                    this.messageService.open('Chuyển trạng thái thành công', 'X', 'success');
                } else {
                    this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
                }
            });
        }
    }

    onGetRowClass(row) {
        if (row.status == 'CANCELLED') {
            return "row-canceled"
        }
    }

    openForm(row, i) {
        const dialogRef = this.dialog.open(PaymentDialogComponent, {
            width: '650px',
            data: {
                payment_method: row.payment_result,
                payment_group: 0,
                commissionData: {
                    receiver_name: row.commission.receiver_name,
                    customer_name: {
                        partner_customer_code: row.commission.customer_code,
                        partner_customer_name: row.commission.customer_name,
                        _id: row.commission.customer_id
                    },
                    roses_percent: row.commission.roses_percent,
                    roses_note: row.commission.roses_note
                },
                totalPrice: row.total,
                paymentOther: row.payment_other,
                edit: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const params = {
                    "commission": result.commission,
                    "payment_other": result.payment_other,
                    "payment_result": result.payment.payment_method,
                    "group_payment": result.payment.payment_group
                };

                this.posService.changePayment(params, row._id).subscribe(data => {
                    if (data.status && data.results) {
                        this.getOrders();
                        this.messageService.open('Cập nhât thành công', 'X', 'success');
                    } else {
                        this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
                    }
                });
            }
        });
    }

    checkTime(time) {
        let now = moment();
        const start = now.startOf('day').unix();
        const end = now.endOf('day').unix();
        return start <= time && end >= time;

    }

    onPrint(row, status) {
        if (this.curBranch.branch_id === '6177d4ae153c67c14676a1f4') {
            this.openReport('/reports/nhahang/GiatLa/PhieuInHoaDonGiatLa', row);
        } else {
            const params = {
                id: row
            };
            this.posService.rePrint(params, status).subscribe(data => {
                if (data.status && data.results) {
                    this.messageService.open('Yêu cầu in lại hóa đơn thành công!', 'X', 'success');
                } else {
                    this.messageService.open('Yêu cầu in thất bại!', 'X', 'error');
                }
            });
        }
    }
    /**
     * Todo: tổng hợp đồ ăn gồm bao nhiêu món + ghi chú từng món
     * */
    openReport(report: string = '/reports/nhahang/InBarcodeManicafe' , id) {
        let printModel = {
            list_id: "{$oid:" + "'" + id + "'" + "}",
            format: 'pdf',
            report_router: report
        };
        this.reportService.export(printModel, 'p');
    }
}

// todo: popup chon phuong thuc thanh toan
@Component({
    selector: 'note-cancel-dialog',
    templateUrl: 'note-cancel-dialog.component.html',
    styleUrls: ['./history.component.scss'],
})
export class NoteCancelDialogComponent {
    constructor(
        public globals: Globals,
        public dialogRef: MatDialogRef<NoteCancelDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}

    note: any;
    errorMsg = "";
    title = "";
    ngOnInit() {
        this.title = (this.data.title !== undefined && this.data.title != "") ? this.data.title : "Ghi chú và xác nhận hủy order";
    }

    close() {
        this.dialogRef.close();
    }

    save() {
        this.errorMsg = '';
        if (!this.note || this.note == "") {
            this.errorMsg = "Vui lòng nhập thông tin ghi chú!"
        } else {
            this.dialogRef.close({
                note: this.note
            });
        }
        return false;
    }
}
