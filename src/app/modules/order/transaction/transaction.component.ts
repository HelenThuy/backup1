import {Component, OnInit, ViewChild} from '@angular/core';
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
import {ReportService} from '../../../services/report.service';
import {ConfirmDialogComponent} from '../../../core/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material';
import {interval} from 'rxjs';

@Component({
	selector: 'app-admin-order-history',
	templateUrl: './transaction.component.html',
	styleUrls: ['./transaction.component.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class TransactionComponent implements OnInit {
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
    rooms: any;
    tmpRooms: any;
    parents: any;
    tmpParents: any;
    curStatus = "";
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

    timeBox = [
        {
            "time_code": "used_at",
            "time_name": "Ngày dùng"
        },
        {
            "time_code": "created_at",
            "time_name": "Ngày tạo"
        },
        {
            "time_code": "updated_at",
            "time_name": "Ngày cập nhật"
        },
    ];
    pageLimitOptions = [
        {value: '20'},
        {value: '50'},
        {value: '100'}
    ];
    currentPageLimit = '20';

    timeBoxSelected = null;
    showNoti = true;

	constructor(private generalService: GeneralService, private messageService: MessageService, public globals: Globals, private posService: PosService,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private reportService: ReportService, public dialog: MatDialog) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.generalService.getParents().subscribe(data => {
            if(data.status == true && data.results) {
                this.parents = data.results;
                this.tmpParents = data.results;
            } else {
                this.parents = [];
                this.tmpParents = [];
            }
        });

        this.searchForm = new FormGroup({
            branch: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchOrderForm = new FormGroup({
            from: new FormControl('', {updateOn: 'change'}),
            to: new FormControl('', {updateOn: 'change'}),
            meal_type: new FormControl('', {updateOn: 'change'}),
            receipt: new FormControl('', {updateOn: 'submit'}),
            time: new FormControl('', {updateOn: 'submit'}),
            patient_id: new FormControl('', {updateOn: 'submit'}),
            fullname: new FormControl('', {updateOn: 'submit'}),
            parent: new FormControl('', {updateOn: 'change'}),
            room: new FormControl('', {updateOn: 'change'}),
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
                    if(dataBranch.status == true && dataBranch.results) {
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
            patient_id: "",
            fullname: "",
            parent: "",
            room: "",
            time: this.timeBox[0]
        });

        this.getOrders();
    }
    /**
     * xu ly lay danh sach phong khi chon tang - khoa dieu tri
     * @param e
     */
    changeParent(e) {
        this.getRooms(e.value);
    }

    /**
     * Lay danh sach phong theo tang - khoa dieu tri
     * @param parent
     */
    getRooms(parent) {
        const params = {
            parent_id: (parent) ? parent.parent_id : ''
        };
        this.generalService.getRooms(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.rooms = data.results;
                this.tmpRooms = data.results;
            } else {
                this.rooms = [];
                this.tmpRooms = [];
            }
        });
    }

    /**
     * Lay danh sach giuong theo phong
     */
    // getBeds() {
    //     if (this.rooms && this.searchOrderForm.value.room) {
    //         const curRoom = this.searchOrderForm.value.room;
    //         const rooms = this.rooms.filter(function(room) {
    //             return (room.room_name == curRoom.room_name);
    //         });
    //
    //         this.beds = (rooms && rooms[0]) ? rooms[0].beds : [];
    //     }
    // }

	getOrders(n = this.currentPageLimit, p= 1) {
        const params = {
            branch_id: (this.searchForm && this.searchForm.value.branch.branch_id) ? this.searchForm.value.branch.branch_id : this.searchForm.value.branch._id,
            n: n,
            p: p,
            order_type: "DOANDIEUTRI",
            status: this.curStatus,
            from: (this.searchOrderForm && this.searchOrderForm.value.from) ? moment(this.searchOrderForm.value.from).startOf('day').unix() : '',
            to: (this.searchOrderForm && this.searchOrderForm.value.to) ? moment(this.searchOrderForm.value.to).endOf('day').unix() : '',
            receipt_id: (this.searchOrderForm && this.searchOrderForm.value.receipt) ? this.searchOrderForm.value.receipt : '',
            meal_type: (this.searchOrderForm && this.searchOrderForm.value.meal_type) ? this.searchOrderForm.value.meal_type.meal_type_id : '',
            patient_id: (this.searchOrderForm && this.searchOrderForm.value.patient_id) ? this.searchOrderForm.value.patient_id : '',
            fullname: (this.searchOrderForm && this.searchOrderForm.value.fullname) ? this.searchOrderForm.value.fullname : '',
            time: (this.searchOrderForm && this.searchOrderForm.value.time) ? this.searchOrderForm.value.time.time_code : 'updated_at',
            room: (this.searchOrderForm && this.searchOrderForm.value.room) ? this.searchOrderForm.value.room.room_id : '',
            parent: (this.searchOrderForm && this.searchOrderForm.value.parent) ? this.searchOrderForm.value.parent.parent_id : ''
        }

        this.posService.history(params).subscribe(data => {
            if (data.status && data.results) {
                this.orders = [...data.results];
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

    compareObj(c1:any, c2:any) {
        return (c1 == c2)
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

    changeStatus(row, e) {
        const params = {
            "patient_id": row.patient_id,
            "reservation_id": row.reservation_id,
            "status": e
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

    checkAll(e) {
	    let confirmMess;
	    let from;
	    let to;

	    if (e == "CHECKOUT") {
            confirmMess = "Bạn có chắc chắn muốn duyệt tất cả đơn hàng CHECKIN sang CHECKOUT?";
            from = 'CHECKIN';
            to = 'CHECKOUT';
        } else {
            confirmMess = "Bạn có chắc chắn muốn duyệt tất cả đơn hàng BOOKED sang CHECKIN?";
            from = 'BOOKED';
            to = 'CHECKIN';
        }

	    if (confirm(confirmMess)) {
            const params = {
                branch_id: (this.searchForm && this.searchForm.value.branch.branch_id) ? this.searchForm.value.branch.branch_id : this.searchForm.value.branch._id,
                from: from,
                to: to,
                order_type: "DOANDIEUTRI",
                start_time: (this.searchOrderForm && this.searchOrderForm.value.from) ? moment(this.searchOrderForm.value.from).startOf('day').unix() : '',
                end_time: (this.searchOrderForm && this.searchOrderForm.value.to) ? moment(this.searchOrderForm.value.to).endOf('day').unix() : '',
                receipt_id: (this.searchOrderForm && this.searchOrderForm.value.receipt) ? this.searchOrderForm.value.receipt : '',
                meal_type: (this.searchOrderForm && this.searchOrderForm.value.meal_type) ? this.searchOrderForm.value.meal_type.meal_type_id : 0,
                patient_id: (this.searchOrderForm && this.searchOrderForm.value.patient_id) ? this.searchOrderForm.value.patient_id : 0,
                fullname: (this.searchOrderForm && this.searchOrderForm.value.fullname) ? this.searchOrderForm.value.fullname : '',
                time: (this.searchOrderForm && this.searchOrderForm.value.time) ? this.searchOrderForm.value.time.time_code : 'updated_at',
                room: (this.searchOrderForm && this.searchOrderForm.value.room) ? this.searchOrderForm.value.room.room_id : 0,
                parent: (this.searchOrderForm && this.searchOrderForm.value.parent) ? this.searchOrderForm.value.parent.parent_id : 0
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

    checkPrint() {
        if (this.searchOrderForm.value.meal_type) {
            this.openReport('/reports/nhahang/TongSoLuongOrderAnGiongNhau', false);
        } else {
            alert("Vui lòng chọn bữa ăn");
        }
    }

    /**
     * Todo: tổng hợp đồ ăn gồm bao nhiêu món + ghi chú từng món
     * */
    openReport(report: string = '/reports/nhahang/TongHopDoAn', query = true) {
        let printModel = {
            startDate: (this.searchOrderForm && this.searchOrderForm.value.from) ? moment(this.searchOrderForm.value.from).startOf('day').unix() : '',
            endDate: (this.searchOrderForm && this.searchOrderForm.value.to) ? moment(this.searchOrderForm.value.to).endOf('day').unix() : '',
            format: 'pdf',
            report_router: report
        };

        if (this.searchOrderForm) {
            if (this.searchOrderForm.value.meal_type) {
                printModel['meal_name'] = this.searchOrderForm.value.meal_type.meal_type_name;
                if (query) {
                    printModel['meal_type_id'] = '{ "$match": { "meal_type_id": ' + this.searchOrderForm.value.meal_type.meal_type_id + ' } },';
                } else {
                    printModel['meal_type_id'] = "meal_type_id:"+this.searchOrderForm.value.meal_type.meal_type_id;
                }
            }

            if (this.searchOrderForm.value.parent) {
                printModel['parent_name'] = this.searchOrderForm.value.parent.parent_name;
                if (query) {
                    printModel['parent_match'] = '{ "$match": { "parent_id": ' + this.searchOrderForm.value.parent.parent_id + ' } },';
                }  else {
                    printModel['parent_id'] = "parent_id:"+this.searchOrderForm.value.parent.parent_id;
                }
            }

            if (this.searchOrderForm.value.room) {
                printModel['room_name'] = this.searchOrderForm.value.room.room_name;
                if (query) {
                    // printModel['parent_match'] = '{ "$match": { "room_id": ' + this.searchOrderForm.value.room.room_id + ' } },';
                } else {
                    printModel['room_id'] = "room_id:"+this.searchOrderForm.value.room.room_id;
                }
            }
            if (this.searchOrderForm.value.patient_id) {
                if (query) {
                    printModel['patient_match'] = '{ "$match": { "patient_id": ' + this.searchOrderForm.value.patient_id + ' } },';
                } else {
                    printModel['patient_id'] = "patient_id:"+this.searchOrderForm.value.patient_id;
                }
            }

        }
        this.reportService.export(printModel, 'p');
    }

    onPrint(row, status) {
        const params = {
            id: row
        }

        this.posService.rePrint(params, status).subscribe(data => {
            if (data.status && data.results) {
                this.messageService.open('Yêu cầu in lại hóa đơn thành công!', 'X', 'success');
            } else {
                this.messageService.open('Yêu cầu in thất bại!', 'X', 'error');
            }
        });
    }

    searchData(val, e) {
        let data;
        if (e == 'room') {
            data = this.tmpRooms;
        } else {
            data = this.tmpParents;
        }

        if (val.length > 0) {
            const filterValue = val.toLowerCase();
            const result = data.filter(item => item[e + "_name"].toLowerCase().includes(filterValue));

            if (result && result.length > 0) {
                this.setDataTmp(e, result);
            }
        } else {
            this.setDataTmp(e, data);
        }
    }

    setDataTmp(e, val) {
        if (e == 'room') {
            this.rooms = val;
        } else {
            this.parents = val;
        }
    }


}
