import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {CustomEncoder} from '../model/custom-encoder';
import {Data} from '../model/data';

@Injectable()
export class VoucherService {

    constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
                private customEncoder: CustomEncoder) {
    }
    getInfoVoucher(voucher) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('v_c', voucher.voucher_type_code);
        params = params.append('v_n', voucher.voucher_number);
        return this.httpClient.get<Data>(this.globals.API_EHOS_DOMAIN + '/port/9194', {params});
    }
}
