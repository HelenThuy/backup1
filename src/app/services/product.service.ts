import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {Data} from '../model/data';
import {ResultsService} from './results.service';
import {CustomEncoder} from '../model/custom-encoder';


@Injectable()
export class ProductService {
    constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
                private customEncoder: CustomEncoder) {
    }

    getFoodByDayOfWeek(obj) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('branch_id', (obj.branch_id) ? obj.branch_id : '');
        params = params.append('calendar_daily_id', (obj.day_id) ? obj.day_id: '');
        params = params.append('meal_type_id', (obj.meal_type_id) ? obj.meal_type_id: '');
        params = params.append('menu_calendar_daily_id', (obj.menu_calendar_daily_id) ? obj.menu_calendar_daily_id: '');
        params = params.append('n', (obj.n) ? obj.n : "");
        params = params.append('p', (obj.p) ? obj.p : "");

        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/calendar-daily/config', {params});
    }

    saveFoodFromDayOfWeek(id, obj) {
        return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/calendar-daily/config', obj);
    }

}
