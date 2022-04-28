import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class DeviceService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

    getParents() {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/parents');
    }

	getDevices(device: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('n', (device.n) ? device.n : 50);
        params = params.append('p', (device.p) ? device.p : 1);
        params = params.append('query', (device.query) ? device.query : '');
        params = params.append('status', (device.status) ? device.status : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/devices', {params});
    }

    getRooms(room: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        // params = params.append('n', (room.n) ? room.n : 50);
        // params = params.append('p', (room.p) ? room.p : 1);
        params = params.append('parent_id', (room.parent_id) ? room.parent_id : '');
        // params = params.append('status', (room.status) ? room.status : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/rooms', {params});
    }

    update(device: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/device/' + id, device);
        }
    }

    getFeedback(feedback: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('n', (feedback.n) ? feedback.n : 50);
        params = params.append('p', (feedback.p) ? feedback.p : 1);
        params = params.append('rate', (feedback.rate) ? feedback.rate : '');

        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/category/doctor', {params});
    }
}
