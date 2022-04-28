import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class ReportService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

    getReportConfig(data: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('status', (data && data.status) ? data.status : -1);

        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/report/configs', {params});
    }

    updateReportConfig(config: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/report/config/' + id, config);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/report/config', config);
        }
    }

    getDataReport() {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/report/export-pdf');
    }

    open(data, t = 'pdf') {
	    let type = '';
	    switch (t) {
            case 'pdf': type = 'application/pdf'; break;
        }

        if (type && data) {
            const file = new Blob([data], { type: type });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        }
    }

    exportOffice() {
        return new Promise((resolve) => {
            this.httpClient.get(this.globals.API_DOMAIN + '/report/export-pdf',{responseType: 'arraybuffer'}).subscribe((response) => {
                // const reportName = 'xxx';
                const reportName = 'test';

                const formatType = 'application/pdf';

                this.createOffice(response, reportName, formatType);
                resolve(response);
            });
        });
    }

    createOffice(data, fileName, formatType, action = '') {
        const fileURL = URL.createObjectURL(new Blob([data], {type: formatType}));
        if (action == 'd') {
            // TODO: DOWNLOAD FILE
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = fileURL
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(a.href);
            document.body.removeChild(a);
        } else if (action == 'p') {
            // TODO: OPEN PRINT FILE
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = fileURL;
            document.body.appendChild(iframe);
            iframe.contentWindow.print();
        } else {
            // TODO: OPEN NEW TAB
            window.open(fileURL);
        }
    }

    getControl(data: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('report_router', (data && data.report_router) ? data.report_router : '');

        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/report/input-controls', {params});
    }

    export(data, action = '') {
	    if (data.format == 'xlsx') {
            data['ignorePagination'] = true;
        }

        return new Promise((resolve) => {
            this.httpClient.post(this.globals.API_DOMAIN + '/report/export-file', data,
                {responseType: 'arraybuffer'}).subscribe((response) => {
                const reportName = data.report_router.substring(data.report_router.lastIndexOf('/') + 1);
                let formatType = '';
                switch (data.format) {
                    case 'pdf':
                        formatType = 'application/pdf';
                        break;
                    case 'xlsx':
                        formatType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                        break;
                    case 'docx':
                        formatType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                        break;
                    default:
                        break;
                }
                this.createOffice(response, reportName, formatType, action);
                resolve(response);
            });
        });
    }
}
