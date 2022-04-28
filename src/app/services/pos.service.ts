import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class PosService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}


    order(order: any, id: any) {
	    if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/reservation/order/'+id, order);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/reservation/order', order);
        }
    }

    history(obj) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('branch_id', obj.branch_id);
        params = params.append('status', (obj.status) ? obj.status: '');
        params = params.append('n', (obj.n) ? obj.n : "");
        params = params.append('p', (obj.p) ? obj.p : "");
        params = params.append('order_type', (obj.order_type) ? obj.order_type : "");
        params = params.append('from', (obj.from) ? obj.from : "");
        params = params.append('to', (obj.to) ? obj.to : "");
        params = params.append('receipt_id', (obj.receipt_id) ? obj.receipt_id : "");
        params = params.append('meal_type', (obj.meal_type) ? obj.meal_type : "");
        params = params.append('patient_id', (obj.patient_id) ? obj.patient_id : "");
        params = params.append('fullname', (obj.fullname) ? obj.fullname : "");
        params = params.append('time', (obj.time) ? obj.time : "");
        params = params.append('room_id', (obj.room) ? obj.room : "");
        params = params.append('parent_id', (obj.parent) ? obj.parent : "");
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/reservation/orders', {params});
    }

    changeStatus(obj, id) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/reservation/censorship/'+id, obj);
        }
    }

    changePayment(obj, id) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/reservation/order-info/'+id, obj);
        }
    }

    changeStatusAll(status) {
	    return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/reservation/change-status-all', status);
    }

    getOrderByTable(table) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('table_id', table.table_id);
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/reservation/order-by-table', {params});
    }

    rePrint(obj, status = 'CHECKOUT') {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('id', (obj.id) ? obj.id: '');
        if (status == 'CHECKIN') {
            return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/printing/reorder', {params});
        } else {
            return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/printing/order', {params});
        }
    }
}
