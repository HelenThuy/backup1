import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class HistoryService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

	getHistories(history: any) {
		let params = new HttpParams({encoder: this.customEncoder});
		params = params.append('company_id', history.company_id);
		params = params.append('patient_id', history.patient_id);
		params = params.append('from', history.from);
		params = params.append('to', history.to);
		params = params.append('booking_code', (history.booking_code) ? history.booking_code : '');
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/patient/history', {params});
	}

	getByBooking(booking: any) {
		let params = new HttpParams({encoder: this.customEncoder});
		params = params.append('booking_code', booking);
		return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/booking', {params});
	}
}
