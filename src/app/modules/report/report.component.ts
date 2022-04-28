import {Component, OnInit} from '@angular/core';
import {APP_DATE_FORMATS, AppDateAdapter, CUSTOM_DATE_FORMATS, CustomNgxDatetimeAdapter} from '../../services/elements/my.date.adapter';
import {MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {MessageService} from '../../services/message.service';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {UiSpinnerService} from '../../services/ui/ui-spinner-service';
import {GeneralService} from '../../services/general.service';
import {ReportService} from '../../services/report.service';
import {MatTreeFlatDataSource} from '@angular/material';
import {TreeItemFlatNode, TreeItemNode} from '../../model/services';
import {FlatTreeControl} from '@angular/cdk/tree';
import {SelectionModel} from '@angular/cdk/collections';
import * as moment from 'moment';
import {NGX_MAT_DATE_FORMATS, NgxMatDateAdapter} from '@angular-material-components/datetime-picker';

@Component({
	selector: 'app-admin-menu-branch',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.scss'],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        {provide: DateAdapter, useClass: AppDateAdapter},
        {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
        {
            provide: NgxMatDateAdapter,
            useClass: CustomNgxDatetimeAdapter
        },
        { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
    ]
})
export class ReportComponent implements OnInit {
    constructor(private generalService: GeneralService, private reportService: ReportService, private messageService: MessageService,
                private localStorage: LocalStorage, private uiSpinnerService: UiSpinnerService) {
        this.uiSpinnerService.spin$.next(false);
    }

    reports: any;
    controls: any;
    setting = [];
    curReport: any;
    listData = [];
    tempData = [];
    curRole: any;

	ngOnInit() {
        this.reportService.getReportConfig({status: 1}).subscribe(data => {
            if(data.status == true && data.results) {
                this.reports = data.results;
            } else {
                this.reports = [];
            }
        });
	}

    selectedReport(val) {
	    this.curReport = val;
	    this.controls = null;
	    const params = {
            report_router: val.report_value
        };
        this.reportService.getControl(params).subscribe(data => {
            if (data.status && data.results) {
                let controls = data.results;
                data.results.forEach((val, key) => {
                    controls[key]["control_type"] = "text";
                    let desc = val.description;
                    if (desc && desc.length > 0) {
                        let type = desc.split("|");
                        if (type.length > 1) {
                            if (type[0] == 'type:singleSelect') {
                                if (!this.listData[val.label]) {
                                    this.localStorage.getItem('setting').subscribe((data) => {
                                        if (data.role.role_id != 1 && val.id == 'branch') {
                                            const tmpData = [
                                                {
                                                    _id: data.branch.branch_id,
                                                    branch_code: data.branch.branch_code,
                                                    branch_name: data.branch.branch_name,
                                                }
                                            ]
                                            controls[key]["data"] = tmpData;
                                            this.tempData[key] = tmpData;
                                        } else {
                                            this.generalService.getDynamicApi(type[1]).subscribe(dataApi => {
                                                if (dataApi.status && dataApi.results) {
                                                    if (val.id == 'customer') {
                                                        let arrData = [];
                                                        dataApi.results.forEach((item) => {
                                                            arrData.push({
                                                                _id: '{$match: {"commission.customer_id": "'+ item._id +'" }}',
                                                                customer_code: item.partner_customer_code,
                                                                customer_name: item.partner_customer_name,
                                                            });
                                                        });
                                                        controls[key]["data"] = arrData
                                                        this.tempData[key] = arrData;
                                                    } else {
                                                        controls[key]["data"] = dataApi.results;
                                                        this.tempData[key] = dataApi.results;
                                                    }

                                                } else {
                                                    this.tempData[key] = null;
                                                    controls[key]["data"] = [];
                                                }
                                            });
                                        }
                                    });
                                }
                                controls[key]["control_type"] = "select";
                            }
                        }

                        if (desc == 'type|Date|Min') {
                            let start = new Date();
                            start.setHours(0,0,0,0);
                            this.setting[key] = start;
                        }

                        if (desc == 'type|Date|Max') {
                            let end = new Date();
                            end.setHours(23,59,59,999);
                            this.setting[key] = end;
                        }
                    }
                });

                this.controls = controls;
            }
        });
    }

    open(type) {
        let params = {
            "format": type,
            "report_router": this.curReport.report_value
        }

        this.controls.forEach((val, key) => {
            if (val.description == "type|Date|Min") {
                params[val.id] = moment(this.setting[key]).unix();
            } else if (val.description == "type|Date|Max") {
                params[val.id] = moment(this.setting[key]).unix();
            } else {
                params[val.id] = (this.setting[key]) ? this.setting[key] : '';
            }
        });

        this.reportService.export(params);
    }

    searchData(val, i) {
        if (val.length > 0) {
            const filterValue = val.toLowerCase();
            const result = this.tempData[i].filter(item => item[this.controls[i].id + "_name"].toLowerCase().includes(filterValue));

            if (result && result.length > 0) {
                this.controls[i].data = result;
            }
        } else {
            this.controls[i].data = this.tempData[i];
        }
    }

    compareObjects(c1:any, c2:any) {
        return (c1 == c2)
    }
}
