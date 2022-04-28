import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {UiSpinnerService} from '../../../services/ui/ui-spinner-service';
import {MessageService} from '../../../services/message.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {APP_DATE_FORMATS, AppDateAdapter} from '../../../services/elements/my.date.adapter';
import {MAT_DATE_FORMATS, DateAdapter} from '@angular/material/core';
import * as moment from 'moment';
import {GeneralService} from '../../../services/general.service';
import {Globals} from '../../../app.globals';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {CategoryService} from '../../../services/category.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {PosService} from '../../../services/pos.service';
import {TableService} from '../../../services/table.service';
import {ReportService} from '../../../services/report.service';
import {VoucherService} from '../../../services/voucher.service';
import {el} from '@angular/platform-browser/testing/src/browser_util';

export interface FeeData {
    tax: string;
    service: string;
    discount: string;
}
export interface VoucherData {
    voucher_type_code: string;
    voucher_number: string;
    amount: number;
    max_amount: number;
    percent: number;
}

export interface CustomerData {
    partner_customer_code: string;
    partner_customer_name: string;
    _id: string;
}

export interface CommissionData {
    receiver_name: string;
    customer_name: CustomerData;
    roses_percent: number;
    roses_note: string;
}

@Component({
	selector: 'app-admin-tool-menu',
	templateUrl: './pos.component.html',
	styleUrls: ['./pos.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class PosComponent implements OnInit {
    @ViewChild('cook') cook;
    @ViewChild('bar') bar;
    @ViewChild('cake') cake;
    @ViewChild('giatla') giatla;
    public config: PerfectScrollbarConfigInterface = {};

    showCook: boolean = true;
    showBar: boolean = true;
    showCake: boolean = true;
    showGiatla: boolean = true;
    showCombo: boolean = true;
    isOpen: boolean = false;
    branches: any;
    products: any;
    productCookCategories: any;
    productBarCategories: any;
    productCakeCategories: any;
    productGiatlaCategories: any;
    searchForm: FormGroup;
    showContent: boolean = false;
    showBranch: boolean = false;
    tickets: any = [];
    cartTotal = 0;
    cartNumItems = 0;
    taxFee = 0;
    discount = 0;
    voucher = 0;
    serviceFee = 0;
    totalPrice = 0;
    dialogData: FeeData = {
        tax: '0%',
        service: '0%',
        discount: '0%'
    };
    dialogVoucherData: VoucherData = {
        voucher_type_code: '',
        voucher_number: '',
        amount: 0,
        max_amount: 0,
        percent: 0
    };
    commissionData: CommissionData = {
        receiver_name: '',
        customer_name: null,
        roses_percent: 0,
        roses_note: ''
    };
    curRole: any;
    curBranch: any;
    orderId = null;
    receptionId = null;
    payment = {
        payment_method: "CASH",
        payment_group: 0
    }
    searchCtrl = new FormControl("");
    showPos = true;
    tables: any;
    tempTables: any;
    curTable: any;
    errTable = "";
    paymentOther = {
        room: 0,
        debit: 0,
        card: 0,
        free: 0,
        bank: 0,
        voucher: 0,
        cash: 0,
        tip: 0
    };
    totalItem = 0;
    listProductPrint: any;
    branchConfiGiatla = ['6177d4ae153c67c14676a1f4', '623944cc19a07bce54d4aa33'];

	constructor(private generalService: GeneralService, private messageService: MessageService, public globals: Globals, private categoryService: CategoryService,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService, private posService: PosService, public dialog: MatDialog,
                private tableService: TableService, private reportService: ReportService) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.searchForm = new FormGroup({
            branch: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.localStorage.getItem('setting').subscribe((data) => {
            this.curBranch = data.branch;

            if (data.role.role_id != 1 && data.role.role_id != 2) {
                this.generalService.getBranchById(data.branch.branch_id).subscribe(dataBranch => {
                    if (dataBranch.status && dataBranch.results) {
                        this.curBranch = dataBranch.results;
                        if (dataBranch.results.status == 1) {
                            // todo: role nhan vien -> set mac dinh chi nhanh
                            this.curRole = data.role;
                            this.searchForm.setValue({
                                branch: data.branch
                            })
                            this.getConfig();
                        } else {
                            // todo: xu ly disable khi branch status == 0
                            this.showPos = false;
                        }
                    }

                });
            } else {
                // todo: role admin/quan ly -> cho chon chi nhanh
                this.generalService.getBranchById(data.branch.branch_id).subscribe(dataBranch => {
                    if(dataBranch.status == true && dataBranch.results) {
                        this.curBranch = dataBranch.results;
                        // this.branches = dataBranch.results;

                        this.searchForm.setValue({
                            branch: data.branch
                        });


                        this.getConfig();
                    } else {
                        this.branches = [];
                    }
                });

                this.showBranch = true;
            }
        });
	}

	getTables(setDefault = false) {
        const params = {
            status: 1,
            branch_id: (this.curBranch && this.curBranch.branch_id) ? this.curBranch.branch_id : ((this.curBranch._id) ? this.curBranch._id : ""),
        };

        this.tableService.getTables(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.tables = data.results;
                this.tempTables = data.results;

                if (setDefault) {
                    this.tables.forEach((item) => {
                       if (item.using == false) {
                           this.curTable = item;
                           return true;
                       }
                    });
                }
            } else {
                this.tables = [];
            }
        });
    }

    searchTable(val) {
        if (val.length > 0) {
            const filterValue = val.toLowerCase();
            const result = this.tempTables.filter(item => item["table_name"].toLowerCase().includes(filterValue));

            if (result && result.length > 0) {
                this.tables = result;
            }
        } else {
            this.tables = this.tempTables;
        }
    }

	getConfig() {
        this.products = [];
        this.clearCart();
        this.getTables(true);
        // todo: lay danh sach menu nha bep
        this.categoryService.getCategory({parent_id: '1050100000000000000', status: 1}).subscribe(data => {
            if(data.status == true && data.results) {
                this.productCookCategories = data.results;
            } else {
                this.productCookCategories = [];
            }
        });

        // todo: lay danh sach menu quay bar
        this.categoryService.getCategory({parent_id: '1050600000000000000', status: 1}).subscribe(data => {
            if(data.status == true && data.results) {
                this.productBarCategories = data.results;
            } else {
                this.productBarCategories = [];
            }
        });

        // todo: lay danh sach menu quay banh
        this.categoryService.getCategory({parent_id: '1050800000000000000', status: 1}).subscribe(data => {
            if(data.status == true && data.results) {
                this.productCakeCategories = data.results;
            } else {
                this.productCakeCategories = [];
            }
        });
        // todo: lay danh sach menu giat la
        this.categoryService.getCategory({parent_id: '1050900000000000000', status: 1}).subscribe(data => {
            if(data.status == true && data.results) {
                this.productGiatlaCategories = data.results;
            } else {
                this.productGiatlaCategories = [];
            }
        });
        this.showContent = true;
        this.selectedCategory({_id: "609509aa7b32eb13c4319a14"}, 50, 1, '',  true);

        this.searchCtrl.valueChanges.subscribe(x => {
            this.selectedCategory({_id: ""}, 50, 1, x, true);
        });
    }

    /**
     * Todo: hiển thị, ẩn nút quầy bar hoặc bếp
     * */
    showHiddenButtonBarCookNav(currentEvent: string) {
        this.isOpen = !this.isOpen;

        if (this.isOpen === true) {
            this.showCook = false;
            this.showBar = false;
            this.showCake = false;
            this.showGiatla = false;
            if (currentEvent === 'cook') {
                this.showCook = true;
            } else if (currentEvent === 'bar') {
                this.showBar = true;
            } else if (currentEvent === 'cake') {
                this.showCake = true;
            } else if (currentEvent === 'giatla') {
                this.showGiatla = true;
            }
        } else {
            this.showCook = true;
            this.showBar = true;
            this.showCake = true;
            this.showGiatla = true;
        }

    }

    /**
     * Todo: chọn danh mục sản phẩm -> show tất cả các sản phẩm trong danh mục vừa chọn
     * */
    selectedCategory(e, n = 12, p = 1, query = '', reCheck = false) {
        let branch_id = '';
        if (this.searchForm) {
            branch_id = (this.searchForm.value.branch.branch_id) ? this.searchForm.value.branch.branch_id : this.searchForm.value.branch._id;
        }
        const params = {
            branch_id: branch_id,
            n: n,
            p: p,
            query: query
        };

        this.categoryService.getItemByCategory(e._id, params).subscribe(data => {
            if (data.status === true) {
                this.products = data.results;
            } else {
                if (reCheck == true) {
                    this.selectedCategory({_id: ""}, 50, 1);
                } else {
                    this.products = [];
                }
            }
        });

        // Todo: để lại trạng thái bình thường trước khi chọn danh mục
        this.isOpen = false;
        this.showCook = true;
        this.showBar = true;
        this.showCake = true;
    }

    /**
     * Todo: thêm sản phẩm vào hóa đơn
     * */
    addToCheck(item) {
        this.errTable = "";
        if (!this.curTable) {
            this.errTable = "Vui lòng chọn bàn!";
            return false;
        }

        let i = -1;
        // todo: get index of item in cart
        this.tickets.filter(function (v, k) {
            if (v._id == item._id && v.product_code == item.product_code && item.status == v.status && v.price == item.price) {
                i = k;
                return v;
            }
        });

        // Todo: If the item already exists, add 1 to quantity
        if (i >= 0) {
            this.tickets[i].quantity += 1;
        } else {
            item.status = "CHECKIN";
            item.discount = 0;
            item.discount_rate = 0;
            item.discount_field = "";
            item.discount_value = 0;
            item.quantity = 1;
            item.note = '';
            item.is_edit = false;
            this.tickets.push(item);
        }

        if (item.combo && item.combo.length > 0) {
            const dialogRef = this.dialog.open(ComboDialogComponent, {
                width: '777px',
                data: {
                    combo: item.combo
                },

            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.addToCheck(result);
                }
            });
        }

        this.calculateTotal();
    }

    /**
     * Todo: xóa sản phẩm khỏi hóa đơn
     * */
    removeItem(item) {
        // Todo: Check if item is in array
        if (this.tickets.includes(item)) {
            // Todo: Splice the element out of the array
            const index = this.tickets.indexOf(item);
            if (index > -1) {
                // Todo: Set item quantity back to 1 (thus when readded, quantity isn't 0)
                this.tickets[this.tickets.indexOf(item)].quantity = 1;
                this.tickets.splice(index, 1);
            }
        }
        this.calculateTotal();
    }

    /**
     * Todo: cancel item da dat
     * */
    cancelItem(item, i, e) {
        if (e == 'un-cancel') {
            item.status = "CHECKEDIN";
        } else {
            const dialogRef = this.dialog.open(NoteCancelItemDialogComponent, {
                width: '650px',
                data: {

                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result && result.note) {
                    item.note = result.note;
                    item.status = "CANCEL";
                }
            });
        }
        this.tickets[i] = item;
    }

    /**
     * Todo: tính toán tổng tiền hóa đơn
     * */
    calculateTotal() {
        let total = 0;
        let cartNum = 0;
        let totalItem = 0;
        // Todo: Multiply item price by item quantity, add to total
        if (this.tickets.length > 0) {
            this.tickets.forEach(function (item) {
                if (item.status != 'CANCELLED' && item.status != 'CANCEL') {
                    total += ((item.price - item.discount_value) * Number(item.quantity));
                    cartNum += Number(item.quantity);
                    totalItem += 1;
                }
            });
        }

        this.totalItem = totalItem;
        this.cartTotal = total;
        this.cartNumItems = cartNum;
        this.calculateFee();
        this.calculateVoucher();
        this.totalPrice = (total - this.discount + this.taxFee + this.serviceFee) - this.voucher;
    }

    /**
     * Todo: xóa trắng danh sách sản phẩm đã chọn
     * */
    clearCart() {
        // Todo: Reduce back to initial quantity (1 vs 0 for re-add)
        if (this.tickets.length > 0) {
            this.tickets.forEach(function (item) {
                item.quantity = 1;
            });
        }
        // Todo: Empty local ticket variable then sync
        this.tickets = [];
        this.cartNumItems = 0;
        this.cartTotal = 0;
        this.taxFee = 0;
        this.serviceFee = 0;
        this.discount = 0;
        this.orderId = null;
        this.receptionId = null;
        this.dialogData.service = (this.curBranch.service_rate && this.curBranch.service_rate > 0) ? this.curBranch.service_rate + "%" : "0%";
        this.dialogData.tax = (this.curBranch.tax_rate && this.curBranch.tax_rate > 0) ? this.curBranch.tax_rate + "%" : "0%";
        this.dialogData.discount = "0%";
        this.payment = {
            payment_method: "CASH",
            payment_group: 0
        }

        this.setCommission({
            receiver_name: '',
            customer_code: '',
            customer_name: '',
            customer_id: '',
            roses_percent: 0,
            roses_note: ''
        });
        this.voucher = 0;
        this.dialogVoucherData = {
            voucher_type_code: '',
            voucher_number: '',
            amount: 0,
            max_amount: 0,
            percent: 0
        };
        this.curTable = null;
        this.errTable = "";
        this.calculateTotal();
    }

    /**
     * Todo: submit order
     * */
    goOrder(status) {
        this.errTable = "";
        if (!this.curTable) {
            this.errTable = "Vui lòng chọn bàn!";
            return false;
        }

        let service = 0;
        let serviceRate = 0;
        let tax = 0;
        let taxRate = 0;
        let discount = 0;
        let discountRate = 0;

        if (this.dialogData.service.indexOf('%') >= 0) {
            serviceRate = parseInt(this.dialogData.service);
        } else {
            service = parseInt(this.dialogData.service);
        }

        if (this.dialogData.tax.indexOf('%') >= 0) {
            taxRate = parseInt(this.dialogData.tax);
        } else {
            tax = parseInt(this.dialogData.tax);
        }

        if (this.dialogData.discount.indexOf('%') >= 0) {
            discountRate = parseInt(this.dialogData.discount);
        } else {
            discount = parseInt(this.dialogData.discount);
        }


        if (this.tickets.length > 0) {
            if (this.receptionId) {
                let deleted = 0;
                this.tickets.forEach(item => {
                    if (item.status == 'CANCEL' || item.status == 'CANCELLED') {
                        deleted += 1;
                    }
                });

                if (deleted >= this.tickets.length) {
                    status = 'CANCEL';
                }
            }

            // this.commissionData
            const params = {
                "table": this.curTable,
                "commission": {
                    receiver_name: this.commissionData.receiver_name,
                    customer_name: (this.commissionData.customer_name) ? this.commissionData.customer_name.partner_customer_name : '',
                    customer_code: (this.commissionData.customer_name) ? this.commissionData.customer_name.partner_customer_code : '',
                    customer_id: (this.commissionData.customer_name) ? this.commissionData.customer_name._id : '',
                    roses_percent: this.commissionData.roses_percent,
                    roses_note: this.commissionData.roses_note,
                },
                "discount_rate": discountRate,
                "discount": discount,
                "service_charge_rate": serviceRate,
                "service_charge": service,
                "tax_rate": taxRate,
                "tax": tax,
                "reservation_id": this.receptionId,
                "branch_code": this.searchForm.value.branch.branch_code,
                "branch_name": this.searchForm.value.branch.branch_name,
                "branch_id": (this.searchForm.value.branch._id) ? this.searchForm.value.branch._id : this.searchForm.value.branch.branch_id,
                "products": this.tickets,
                "status": status,
                "order_type": "RESTAURANT",
                "payment_result": this.payment.payment_method,
                "group_payment": this.payment.payment_group,
                "used_at": moment().startOf('day').add(1, 'second').unix(),
                "payment_other": this.paymentOther,
                'voucher_type_code': this.dialogVoucherData.voucher_type_code,
                'voucher_number': this.dialogVoucherData.voucher_number
            };
            // console.log(params); return;
            // todo: Nếu không thuộc chi nhánh gặt là thì in như cũ
            if (this.curBranch._id !== '6177d4ae153c67c14676a1f4') {
                this.uiSpinnerService.spin$.next(true);
            }
            this.posService.order(params, this.orderId).subscribe(data => {
                if (data.status) {
                    if (status == "CHECKIN") {
                        // todo: In phiếu order giặt là
                        if (this.curBranch._id === '6177d4ae153c67c14676a1f4') {
                            this.openReport('/reports/nhahang/GiatLa/PhieuInOrderGiatLa');
                        }
                        this.getTables();
                        this.changeTable(this.curTable);
                    } else {
                        // todo: In phiếu hóa đơn giặt là
                        if (this.curBranch._id === '6177d4ae153c67c14676a1f4') {
                            this.openReport('/reports/nhahang/GiatLa/PhieuInHoaDonGiatLa');
                        }
                        this.clearCart();
                        this.getTables(true);
                    }
                    this.messageService.open('Đặt món thành công!', 'X', 'success');
                } else {
                    if (data.errors.code == "ERR_THE_BILL_PAID_BEFORE") {
                        this.clearCart();
                        this.messageService.open(data.errors.message, 'X', 'error');
                    } else if (data.errors.code == "ERR_TABLE_USING") {
                        this.getTables();
                        this.messageService.open(data.errors.message, 'X', 'error');
                    } else {
                        this.messageService.open('Có lỗi trong quá trình đặt món!', 'X', 'error');
                    }

                }
                if (this.curBranch._id !== '6177d4ae153c67c14676a1f4') {
                    this.uiSpinnerService.spin$.next(false);
                }
            });
        } else {
            this.messageService.open('Chưa có sản phẩm nào trong giỏ hàng!', 'X', 'error');
        }
    }

    calculateFee() {
        this.dialogData.tax = (parseInt(this.dialogData.tax) > 0) ? this.dialogData.tax : '0%';
        this.dialogData.service = (parseInt(this.dialogData.service) > 0) ? this.dialogData.service : '0%';
        this.dialogData.discount = (parseInt(this.dialogData.discount) > 0) ? this.dialogData.discount: '0%';

        // todo: check giam gia
        if (this.dialogData.discount.indexOf('%') >= 0) {
            if (parseInt(this.dialogData.discount) > 100) {
                this.dialogData.discount = "100%";
            }
            this.discount = (this.cartTotal / 100 * parseInt(this.dialogData.discount));
        } else {
            if (parseInt(this.dialogData.discount) > this.cartTotal) {
                this.dialogData.discount = this.cartTotal + "";
            }
            this.discount = parseInt(this.dialogData.discount);
        }

        // todo: check gia tinh phi dich vu
        if (this.dialogData.service.indexOf('%') >= 0) {
            this.serviceFee = ((this.cartTotal - this.discount) / 100 * parseInt(this.dialogData.service));
        } else {
            this.serviceFee = parseInt(this.dialogData.service);
        }

        // todo: check gia tinh thue
        if (this.dialogData.tax && this.dialogData.tax.indexOf('%') >= 0) {
            this.taxFee = ((this.cartTotal-this.discount+this.serviceFee) / 100 * parseInt(this.dialogData.tax));
        } else {
            this.taxFee = parseInt(this.dialogData.tax);
        }
    }
    calculateVoucher() {
        /**
         * todo: check giá miễm giảm voucher theo %
         * * */
        let cartTotal = this.cartTotal - this.discount + this.taxFee + this.serviceFee;
        if (this.dialogVoucherData.percent > 0) {
            this.voucher = (cartTotal / 100 * this.dialogVoucherData.percent);
            this.voucher = (this.voucher > this.dialogVoucherData.max_amount) ? this.dialogVoucherData.max_amount : this.voucher;
        }
        if (this.dialogVoucherData.amount > 0) {
            this.voucher = (this.dialogVoucherData.amount > cartTotal) ? cartTotal : this.dialogVoucherData.amount;
        }
        if (this.dialogVoucherData.percent === 0 && this.dialogVoucherData.amount === 0){
            this.voucher = 0;
        }
        if (this.voucher > 0) {
            this.payment.payment_method = 'OTHER';
            this.paymentOther.cash = ((cartTotal - this.voucher) > 0) ? cartTotal - this.voucher : 0;
            this.paymentOther.voucher = this.voucher;
        }
    }

    /**
     * Todo: mo setting thue, phi
     * */
    openDialog(): void {
        const dialogRef = this.dialog.open(FeeDialogComponent, {
            width: '350px',
            data: this.dialogData
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dialogData = result;
                this.calculateTotal();
            }
        });
    }

    /**
     * Todo: mo setting voucher
     * */
    openVoucherDialog(): void {
        const dialogRef = this.dialog.open(VoucherDialogComponent, {
            width: '350px',
            data: this.dialogVoucherData
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dialogVoucherData = result.voucher;
                this.calculateTotal();
            }
        });
    }

    /**
     * Todo: mo setting san pham
     * */
    openNote(item, i) {
        const data = Object.assign({},item);
        const dialogRef = this.dialog.open(NoteDialogComponent, {
            width: '350px',
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {

            if (result) {
                if (result.discount_field) {
                    if (result.discount_field.indexOf('%') >= 0) {
                        result.discount_rate = parseInt(result.discount_field);
                        result.discount = 0;
                        result.discount_value = (result.price / 100 * parseInt(result.discount_field));
                    } else {
                        result.discount_rate = 0;
                        result.discount = parseInt(result.discount_field);
                        result.discount_value = parseInt(result.discount_field);
                    }
                }

                this.tickets[i] = result;
                this.calculateTotal();
            }
        });
    }

    /**
     * Todo: lay danh sach hoa don dang co
     * */
    openBillList() {
        const dialogRef = this.dialog.open(BillDialogComponent, {
            width: '960px',
            data: {
                branch: this.searchForm.value.branch
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.setCommission(result.commission);
                this.addMultiToCart(result);
            }
        });
    }

    addMultiToCart(result) {
        this.curTable = result.table;
        this.voucher = result.voucher_value;
        this.dialogVoucherData = result.voucher_info;
        // todo: set giam gia
        if (result.discount_rate > 0) {
            this.dialogData.discount = result.discount_rate + '%';
        } else if (result.tax > 0) {
            this.dialogData.discount = result.discount_rate + '';
        } if (result.discount > 0) {
            this.dialogData.discount = result.discount + '';
        } else {
            this.dialogData.discount = '0%';
        }

        // todo: set thue
        if (result.tax_rate > 0) {
            this.dialogData.tax = result.tax_rate + '%';
        } else if (result.tax > 0) {
            this.dialogData.tax = result.tax + '';
        } else {
            this.dialogData.tax = '0%';
        }

        // todo: set phi dich vu
        if (result.service_charge_rate > 0) {
            this.dialogData.service = result.service_charge_rate + '%';
        } else if (result.service_charge > 0) {
            this.dialogData.service = result.service_charge + '';
        } else {
            this.dialogData.service = '0%';
        }
        this.cartTotal = result.total_before_tax;

        result.products.forEach((value, key) => {
            if (value.discount_rate > 0) {
                result.products[key].discount_value = (value.price / 100 * parseInt(value.discount_rate));
            } else if (value.discount > 0) {
                result.products[key].discount_value = value.discount;
            } else {
                result.products[key].discount_value = 0;
            }
        });
        this.tickets = result.products;
        this.orderId = result._id;
        this.receptionId = result.reservation_id;
        this.calculateTotal();
    }
    /**
     * Todo: mo popup chon phuong thuc thanh toan
     */
    openPayment() {
        const dialogRef = this.dialog.open(PaymentDialogComponent, {
            width: '650px',
            data: {
                payment_method: this.payment.payment_method,
                payment_group: 0,
                commissionData: this.commissionData,
                totalPrice: (this.totalPrice + this.voucher),
                paymentOther: this.paymentOther
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.payment = result.payment;
                this.payment.payment_group = (result.payment_group == true || result.payment_group == 1) ? 1 : 0;
                this.paymentOther = result.payment_other;
                this.setCommission(result.commission);
                this.goOrder('CHECKOUT');
            }
        });
    }

    /**
     * Todo: mo popup cap nhat khach hang, hoa hong
     */
    openCommission() {
        const dialogRef = this.dialog.open(CommissionDialogComponent, {
            width: '350px',
            data: this.commissionData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.setCommission(result);
            }
        });
    }

    changeTable(table) {
        this.tables = this.tempTables;
        this.errTable = '';

        const params = {
            table_id: table._id
        };
        this.posService.getOrderByTable(params).subscribe(data => {
            if (data.status && data.results) {
                this.addMultiToCart(data.results[0]);
                this.setCommission(data.results[0].commission);
            } else {
                this.clearCart();
                this.curTable = table;
            }
        });
    }

    setCommission(commission) {
        this.commissionData = {
            receiver_name: commission.receiver_name,
            customer_name: {
                partner_customer_code: commission.customer_code,
                partner_customer_name: commission.customer_name,
                _id: commission.customer_id,
            },
            roses_percent: commission.roses_percent,
            roses_note: commission.roses_note
        };
    }

    compareTableObjects(c1:any, c2:any) {
        return (c1.table_code == c2.table_code)
    }

    compareObjects(c1:any, c2:any) {
        return (c1.branch_code == c2.branch_code)
    }
    /**
     * Todo: tổng hợp đồ ăn gồm bao nhiêu món + ghi chú từng món
     * */
    openReport(report: string = '/reports/nhahang/InBarcodeManicafe') {
        this.listProductPrint = [];
        this.tickets.forEach(value => {
            if(value.check_print === true){
                this.listProductPrint.push('"'+value.product_code+'"');
            }
        });
        let printModel = {
            list_id: "{$oid:" + "'" + this.orderId + "'" + "}",
            format: 'pdf',
            report_router: report
        };
        if(this.listProductPrint.length){
            printModel['product_match'] = '{ "$match": { "products.product_code" : { $in: [ ' + this.listProductPrint.toString() + ']} } },';
        }
        this.reportService.export(printModel, 'p');
    }
}

// todo: mở popup setting thuế
@Component({
    selector: 'commission-dialog',
    templateUrl: 'commission-dialog.component.html',
})
export class CommissionDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<CommissionDialogComponent>,
        private generalService: GeneralService,
        @Inject(MAT_DIALOG_DATA) public data: CommissionData) {}

    customerData: any;
    receiver_name: any;
    customer_name: any;
    roses_percent: any;
    roses_note: any;
    ngOnInit() {
        this.receiver_name = this.data.receiver_name;
        this.customer_name = this.data.customer_name;
        this.roses_percent = this.data.roses_percent;
        this.roses_note = this.data.roses_note;
        const key = (this.data.customer_name) ? this.data.customer_name.partner_customer_name : '';
        this.getCustomer(key);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    getCustomer(key) {
        const params = {
            key: key,
            n: 10,
            p: 1,
            status: 1
        };
        this.generalService.getCustomers(params).subscribe((data) => {
            if (data.status && data.results) {
                this.customerData = data.results;
            }
        });
    }

    searchCustomer(val) {
        this.getCustomer(val);
    }

    clear() {
        this.receiver_name = null;
        this.customer_name = null;
        this.roses_percent = 0;
        this.roses_note = null;
    }

    save() {
        this.dialogRef.close({
            receiver_name: this.receiver_name,
            customer_name: (this.customer_name) ? this.customer_name.partner_customer_name : '',
            customer_code: (this.customer_name) ? this.customer_name.partner_customer_code : '',
            customer_id: (this.customer_name) ? this.customer_name._id: '',
            roses_percent: this.roses_percent,
            roses_note: this.roses_note,
        });
    }

    compareObjects(c1:any, c2:any) {
        return (c1.partner_customer_code == c2.partner_customer_code)
    }
}

// todo: mở popup setting thuế
@Component({
    selector: 'fee-dialog',
    templateUrl: 'fee-dialog.component.html',
})
export class FeeDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<FeeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: FeeData) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}

// todo: mở popup setting sản phẩm
@Component({
    selector: 'note-dialog',
    templateUrl: 'note-dialog.component.html',
})
export class NoteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<NoteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}

    error = "";
    onNoClick(): void {
        this.dialogRef.close();
    }

    submit() {
        this.error = "";
        if (this.data.discount_field) {
            if (parseInt(this.data.discount_field) < 0) {
                this.error = 'Giá giảm/sp phải lớn hơn 0';
                return false;
            } else if (parseInt(this.data.discount_field) > this.data.price) {
                this.error = 'Giá giảm/sp không được cao hơn giá sản phẩm!';
                return false;
            } else if (this.data.discount_field.indexOf('%') >= 0 && parseInt(this.data.discount_field) > 100) {
                this.error = 'Giá giảm/sp không được quá 100%';
                return false;
            }
        }

        this.dialogRef.close(this.data);
    }
}

// todo: mở popup list billing
@Component({
    selector: 'bill-dialog',
    templateUrl: 'bill-dialog.component.html',
})
export class BillDialogComponent {
    constructor(
        private posService: PosService,
        private reportService: ReportService,
        private messageService: MessageService,
        public dialogRef: MatDialogRef<BillDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}

    bills: any;
    show = false;
    receiptId = '';
    hisCount: any;

    ngOnInit() {
        this.searchBill();
    }

    searchBill(n = 5, p= 1) {
        const params = {
            n: n,
            p: p,
            branch_id: (this.data.branch.branch_id) ? this.data.branch.branch_id : this.data.branch._id,
            status: 'CHECKIN,CHECKOUT',
            receipt_id: (this.receiptId) ? this.receiptId : '',
            order_type: 'RESTAURANT'
        };
        this.posService.history(params).subscribe(data => {
            if (data.status && data.results) {
                this.bills = data.results;
                this.hisCount = data.count;
            } else {
                this.hisCount = 0;
            }
            this.show = true;
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onPrint(row) {
        console.log(this.data);
        if (this.data.branch.branch_id === '6177d4ae153c67c14676a1f4') {
            const printModel = {
                list_id: "{$oid:" + "'" + row + "'" + "}",
                format: 'pdf',
                report_router: '/reports/nhahang/GiatLa/PhieuInHoaDonGiatLa'
            };
            this.reportService.export(printModel, 'p');
        } else {
            const params = {
                id: row
            };
            this.posService.rePrint(params).subscribe(data => {
                if (data.status && data.results) {
                    this.messageService.open('Yêu cầu in lại hóa đơn thành công!', 'X', 'success');
                } else {
                    this.messageService.open('Yêu cầu in thất bại!', 'X', 'error');
                }
            });
        }
    }
    pageCallback(e) {
        this.searchBill(e.limit, (e.offset + 1));
    }

    onSelect(row) {
        this.dialogRef.close(row);
    }
}

// todo: popup chon phuong thuc thanh toan
@Component({
    selector: 'payment-dialog',
    templateUrl: 'payment-dialog.component.html',
})
export class PaymentDialogComponent {
    constructor(
        private generalService: GeneralService,
        public dialogRef: MatDialogRef<PaymentDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}

    showGroup = false;
    commissionData;
    receiver_name: any;
    customer_name: any;
    customerData: any;
    error = "";
    paymentOther: any;
    tmpPaymentOther = {
        room: 0,
        debit: 0,
        card: 0,
        free: 0,
        bank: 0,
        voucher: 0,
        cash: 0,
        tip: 0
    };
    edit = false;
    totalPrice = 0;
    total = 0;

    ngOnInit() {
        this.commissionData = this.data.commissionData;
        this.receiver_name = this.commissionData.receiver_name;
        this.customer_name = this.commissionData.customer_name;
        this.totalPrice = this.data.totalPrice;
        if (this.data.paymentOther) {
            this.paymentOther = this.data.paymentOther;
        } else {
            this.paymentOther = this.tmpPaymentOther;
        }

        this.edit = (this.data.edit);

        const key = (this.customer_name) ? this.customer_name.partner_customer_name : '';
        this.getCustomer(key);
        this.changeMethod();
    }

    changeMethod() {
        this.error = '';
        this.data.payment_group = 0;
        this.showGroup = this.data.payment_method == "ROOM";
    }

    getCustomer(key) {
        this.generalService.getCustomers(key).subscribe((data) => {
            if (data.status && data.results) {
                this.customerData = data.results;
            }
        });
    }

    searchCustomer(val) {
        this.getCustomer(val);
    }

    compareObjects(c1:any, c2:any) {
        return (c1.partner_customer_code == c2.partner_customer_code)
    }

    pay() {
        this.error = '';
        if (!this.data.payment_method || this.data.payment_method == "") {
            this.error = "Vui lòng chọn phương thức thanh toán!";
            return false;
        }

        if (this.data.payment_method == "DEBT" && (!this.customer_name || this.customer_name.partner_customer_name == "")) {
            this.error = "Bạn phải chọn khách hàng nợ. Cảm ơn!";
            return false;
        }

        if (this.data.payment_method == "FREE" && (!this.customer_name || this.customer_name.partner_customer_name == "")) {
            this.error = "Bạn phải chọn khách hàng. Cảm ơn!";
            return false;
        }

        let paymentOther = this.tmpPaymentOther;
        if (this.data.payment_method == "OTHER") {
            const total = (this.paymentOther.room + this.paymentOther.debit + this.paymentOther.card + this.paymentOther.free
                + this.paymentOther.bank + this.paymentOther.voucher + this.paymentOther.cash);

            if (total != this.totalPrice) {
                this.error = "Tổng số tiền không khớp với hóa đơn!";
                return false;
            }

            paymentOther = {
                room: this.paymentOther.room,
                debit: this.paymentOther.debit,
                card: this.paymentOther.card,
                free: this.paymentOther.free,
                bank: this.paymentOther.bank,
                voucher: this.paymentOther.voucher,
                cash: this.paymentOther.cash,
                tip: this.paymentOther.tip
            };
        }

        this.dialogRef.close({
                payment: {
                    payment_method: this.data.payment_method,
                    payment_group: this.data.payment_group
                },
                commission: {
                    receiver_name: this.receiver_name,
                    customer_name: (this.customer_name) ? this.customer_name.partner_customer_name : '',
                    customer_code: (this.customer_name) ? this.customer_name.partner_customer_code : '',
                    customer_id: (this.customer_name) ? this.customer_name._id: '',
                    roses_percent: this.commissionData.roses_percent,
                    roses_note: this.commissionData.roses_note,
                },
                payment_other: paymentOther
            }
        );
    }
}

// todo: popup chon phuong thuc thanh toan
@Component({
    selector: 'combo-dialog',
    templateUrl: 'combo-dialog.component.html',
    styleUrls: ['./pos.component.scss'],
})
export class ComboDialogComponent {
    constructor(
        public globals: Globals,
        public dialogRef: MatDialogRef<ComboDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}

    products: any;
    selectedItem: any;
    error: any;
    ngOnInit() {
        this.error = '';
        this.products = this.data.combo;
    }

    addToCheck(item) {
        this.selectedItem = item;
    }

    submit() {
        if (this.selectedItem) {
            this.error = '';
            this.dialogRef.close(this.selectedItem);
        } else {
            this.error = 'Vui lòng chọn một sản phẩm theo combo!';
        }
    }
}

@Component({
    selector: 'note-cancel-item-dialog',
    templateUrl: 'note-cancel-item-dialog.component.html',
    styleUrls: ['./pos.component.scss'],
})
export class NoteCancelItemDialogComponent {
    constructor(
        public globals: Globals,
        public dialogRef: MatDialogRef<NoteCancelItemDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}

    note: any;
    errorMsg = "";
    ngOnInit() {
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
// todo: mở popup setting thuế
@Component({
    selector: 'voucher-dialog',
    templateUrl: 'voucher-dialog.component.html',
})
export class VoucherDialogComponent {
    error: string;
    constructor(
        private voucherService: VoucherService,
        public dialogRef: MatDialogRef<VoucherDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: VoucherData) {}

    applyVoucher(): void {
        this.data.voucher_type_code = this.data.voucher_type_code.trim();
        this.data.voucher_number = this.data.voucher_number.trim();
        const voucher = {
            voucher_type_code: this.data.voucher_type_code,
            voucher_number: this.data.voucher_number
        };
        this.voucherService.getInfoVoucher(voucher).subscribe(data => {
            if (data.status === true) {
                this.dialogRef.close({
                    voucher: {
                        voucher_type_code: this.data.voucher_type_code,
                        voucher_number: this.data.voucher_number,
                        amount: data.results[0].amount,
                        percent: data.results[0].percent,
                        max_amount: data.results[0].max_amount
                    }
                });
            } else {
                this.error = data.results;
            }
        });
    }
    clearVoucher(): void {
        this.dialogRef.close({
            voucher: {
                voucher_type_code: '',
                voucher_number: '',
                amount: 0,
                percent: 0,
                max_amount: 0
            }
        });
    }
}
