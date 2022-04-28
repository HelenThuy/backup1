import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class GeneralService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

    getDynamicApi(api) {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + api);
    }

    getGeneral() {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/setting');
    }

    update(general: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/setting/' + id, general);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/setting', general);
        }
    }

    getBranch(data:any = null) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('n', (data && data.n) ? data.n : "");
        params = params.append('p', (data && data.p) ? data.p : "");
        params = params.append('query', (data && data.query) ? data.query : '');
        params = params.append('status', (data && data.status) ? data.status : -1);

        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/branches',{params});
    }

    updateBranch(app: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/branch/' + id, app);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/branch', app);
        }
    }

    uploadFile(file: any) {
        return this.httpClient.post<any>(this.globals.API_DOMAIN + '/file/upload', file);
    }

    getBranchById(id:any) {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/branch/' + id);
    }

    getParents() {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/parent/parents');
    }

    getRooms(room: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('parent_id', (room.parent_id) ? room.parent_id : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/parent/rooms', {params});
    }

    getCustomers(data) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('partner_customer_name', (data && data.key) ? data.key : '');
        params = params.append('n', (data && data.n) ? data.n : "");
        params = params.append('p', (data && data.p) ? data.p : "");
        params = params.append('status', (data && data.status) ? data.status : -1);
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/reservation/partner-customers', {params});
    }

    updateCustomer(data: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/reservation/partner-customer/' + id, data);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/reservation/partner-customer', data);
        }
    }
}
