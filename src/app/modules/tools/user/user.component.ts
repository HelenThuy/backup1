import {Component, OnInit} from '@angular/core';
import {LocalStorage} from "@ngx-pwa/local-storage";
import {UiSpinnerService} from "../../../services/ui/ui-spinner-service";
import {MessageService} from "../../../services/message.service";
import {DeviceService} from "../../../services/device.service";
import { SelectionType } from '@swimlane/ngx-datatable';
import {FormData} from '../../../form-data';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material/core";
import * as moment from 'moment';
import {UserService} from "../../../services/user.service";
import {GeneralService} from '../../../services/general.service';

@Component({
	selector: 'app-admin-device',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
    providers: [
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
})
export class UserComponent implements OnInit {
    users: any;
    selected = [];
    SelectionType = SelectionType;
    userForm: FormGroup;
    searchForm: FormGroup;
    showEdit = false;
    parents: any;
    rooms: any;
    beds: any;
    curId: any;
    curIndex: any;
    isNew = true;
    companies: any;
    roles = [
        {
            role_id: 1,
            role_name: 'Super Admin',
            role_code: 'supper_admin'
        },
        {
            role_id: 2,
            role_name: 'Quản lý',
            role_code: 'admin'
        },
        {
            role_id: 3,
            role_name: 'Nhân viên',
            role_code: 'user'
        },
        {
            role_id: 4,
            role_name: 'Y tá',
            role_code: 'nurse'
        },
        {
            role_id: 5,
            role_name: 'Giặt là',
            role_code: 'laundry'
        },
    ];

    data = {
        _id: '',
        username: '',
        name: '',
        password: '',
        confirmPassword: '',
        mail: '',
        role: [],
    };
    fd: any;

	constructor(private userService: UserService, private messageService: MessageService, private generalService: GeneralService,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService) {
        this.uiSpinnerService.spin$.next(false);
	}

	ngOnInit() {
        this.generalService.getBranch().subscribe(data => {
            if(data.status == true && data.results) {
                this.companies = data.results;
                let formData = this.data;
                this.companies.forEach(function (item) {
                    formData[item.company_code] = '';
                });
                this.fd = new FormData(formData);
            } else {
                this.companies = [];
            }
        });

        this.getUsers();

        this.userForm = new FormGroup({
            mail: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            name: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            username: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            password: new FormControl('', {updateOn: 'submit'}),
            branch: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
            role: new FormControl('', {validators: Validators.required, updateOn: 'submit'}),
        });

        this.searchForm = new FormGroup({
            keyword: new FormControl('', {updateOn: 'submit'}),
            role: new FormControl('', {updateOn: 'submit'}),
        });
	}

    /**
     * lay danh sach thanh vien
     */
    getUsers() {
	    const params = {
            username: (this.searchForm && this.searchForm.value.keyword) ? this.searchForm.value.keyword : "",
            role_id: (this.searchForm && this.searchForm.value.role) ? this.searchForm.value.role.role_id : "",
        };

        this.uiSpinnerService.spin$.next(true);
        this.userService.getUsers(params).subscribe(data => {
            if(data.status == true && data.results) {
                this.users = data.results;
            } else {
                this.users = [];
            }
            this.uiSpinnerService.spin$.next(false);
        });
    }

    /**
     * Ham xu ly set du lieu khi select vao 1 device
     * @param selected
     */
    onSelect(selected, i) {
	    this.showEdit = false;
	    if (selected) {
            this.userForm.setValue({
                mail: selected.mail,
                name: selected.name,
                username: selected.username,
                password: '',
                role: selected.role,
                branch: selected.branch,
            });
            this.showEdit = true;
        }
        this.curId = selected._id;
        this.curIndex = i;
    }

    /**
     * Ham update du lieu device
     */
    update() {
        if (this.userForm.valid) {
            const user = {
                mail: this.userForm.value.mail,
                name: this.userForm.value.name,
                username: this.userForm.value.username,
                password: this.userForm.value.password,
                role: {
                    role_code: this.userForm.value.role.role_code,
                    role_id: this.userForm.value.role.role_id,
                    role_name: this.userForm.value.role.role_name,
                },
                branch: {
                    branch_code: this.userForm.value.branch.branch_code,
                    branch_id: (this.userForm.value.branch._id) ? this.userForm.value.branch._id : this.userForm.value.branch.branch_id,
                    branch_name: this.userForm.value.branch.branch_name,
                    service_rate: this.userForm.value.branch.service_rate,
                    tax_rate: this.userForm.value.branch.tax_rate,
                    status: this.userForm.value.branch.status,
                }
            };

            this.userService.updateUser(this.curId, user).subscribe(data => {
                if (data.status) {
                    // todo: tim row index cua row thay doi va cap nhat gia tri moi
                    if (this.curId) {
                        this.users[this.curIndex] = user;
                        this.users[this.curIndex]._id = this.curId;
                        this.users = [...this.users];
                    } else {
                        this.getUsers();
                        this.showEdit = false;
                    }

                    if (this.curId) {
                        this.messageService.open('Cập nhật thông tin thành công!', 'X', 'success');
                    } else {
                        this.messageService.open('Thêm mới thành công!', 'X', 'success');
                    }
                } else {
                    if (data.errors && data.errors.code == "ERR_EXISTS_USERNAME") {
                        this.messageService.open('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!', 'X', 'error');
                    } else {
                        this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
                    }
                }
            });
        } else {
            this.messageService.open('Vui lòng nhập đầy đủ thông tin!', 'X', 'error');
        }
    }

    add() {
        this.showEdit = true;
        this.isNew = true;
        this.curId = 0;
        this.userForm.reset();
        // Object.keys(this.userForm.controls).forEach(key => {
        //     this.userForm.controls[key].setErrors(null)
        // });
    }

    compareBranch(c1:any, c2:any) {
	    return c1._id === c2.branch_id
    }

    compareRole(o1: any, o2: any): boolean {
        return o1.role_id === o2.role_id
    }
}
