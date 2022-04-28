import {Component, OnInit} from '@angular/core';
import {LocalStorage} from "@ngx-pwa/local-storage";
import {UiSpinnerService} from "../../../services/ui/ui-spinner-service";
import {MessageService} from "../../../services/message.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {APP_DATE_FORMATS, AppDateAdapter} from "../../../services/elements/my.date.adapter";
import {MAT_DATE_FORMATS, DateAdapter} from "@angular/material/core";
import {GeneralService} from "../../../services/general.service";
import {readFile} from "xlsx";
import {Globals} from "../../../app.globals";

@Component({
	selector: 'app-admin-general',
	templateUrl: './general.component.html',
	styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
    generalForm: FormGroup;

	constructor(private generalService: GeneralService, private messageService: MessageService, public globals: Globals,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService) {
        this.uiSpinnerService.spin$.next(false);
	}
	curId: any;


	ngOnInit() {
        this.generalForm = new FormGroup({
            usd: new FormControl('', {validators: Validators.required, updateOn: 'submit'})
        });

        this.getGeneral();
	}

    getGeneral() {
        this.generalService.getGeneral().subscribe(data => {
            if(data.status == true && data.results) {
                this.generalForm.setValue({
                    usd: data.results.usd,
                });
                this.curId = data.results._id;
            }
        });
    }

    update() {
        if (this.generalForm.valid) {
            let params = this.generalForm.value;

            this.generalService.update(params, this.curId).subscribe(data => {
                if (data.status == true && data.results) {
                    this.messageService.open('Cập nhật cấu hình thành công', 'X', 'success');
                } else {
                    this.messageService.open('Có lỗi trong quá trình cập nhật!', 'X', 'error');
                }
            });
        } else {
            this.messageService.open('Vui lòng nhập đầy đủ thông tin!', 'X', 'error');
        }
    }
}
