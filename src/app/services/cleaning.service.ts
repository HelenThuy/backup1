import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class CleaningService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

	getCategory(category: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('n', (category.n) ? category.n : 50);
        params = params.append('p', (category.p) ? category.p : 1);
        params = params.append('query', (category.query) ? category.query : '');
        params = params.append('status', (category.status) ? category.status : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/categories', {params});
    }

    update(category: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/category/' + id, category);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/category', category);
        }
    }

    getService(service: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('n', (service.n) ? service.n : 50);
        params = params.append('p', (service.p) ? service.p : 1);
        params = params.append('category_id', (service.category_id) ? service.category_id : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/services', {params});
    }

    saveService(service: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/service/' + id, service);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/service', service);
        }
    }

    getOrder(order: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('n', (order.n) ? order.n : 100);
        params = params.append('p', (order.p) ? order.p : 1);

        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/room-service/orders', {params});
    }
}
