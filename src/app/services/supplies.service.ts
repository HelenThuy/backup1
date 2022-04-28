import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class SuppliesService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

    getSupplies(data:any = null) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('n', (data && data.n) ? data.n : "");
        params = params.append('p', (data && data.p) ? data.p : "");
        params = params.append('query', (data && data.query) ? data.query : '');
        params = params.append('status', (data && data.status) ? data.status : -1);

        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/supplies',{params});
    }

    updateSupplies(app: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/supplies/' + id, app);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/supplies', app);
        }
    }
}
