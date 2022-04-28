import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Globals} from '../app.globals';
import {ResultsService} from './results.service';
import {Data} from '../model/data';
import {CustomEncoder} from '../model/custom-encoder';

@Injectable()
export class CategoryService {

	constructor(private httpClient: HttpClient, private globals: Globals, private resultsService: ResultsService,
	            private customEncoder: CustomEncoder) {
	}

    getCategory(item: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('parent_id', (item.parent_id) ? item.parent_id : '');
        params = params.append('branch_id', (item.branch_id) ? item.branch_id : '');
        params = params.append('keyword', (item.keyword) ? item.keyword : '');
        params = params.append('status', (item.status) ? item.status : '-1');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/categories', {params});
    }

    getMenuTitle(item: any) {
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/menu-calendar-daily', {});
    }

    updateCategory(app: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/category/' + id, app);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/category', app);
        }
    }


    getItem(item: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('keyword', (item.keyword) ? item.keyword : '');
        params = params.append('category_id', (item.category && item.category._id) ? item.category._id : '');
        params = params.append('status', (item.status) ? item.status : '-1');
        params = params.append('n', (item.n) ? item.n : '1000');
        params = params.append('p', (item.p) ? item.p : '1');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/products', {params});
    }

    updateItem(app: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/product/' + id, app);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/product', app);
        }
    }

    getItemByCategory(id: any, data) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('p', (data.p) ? data.p : '');
        params = params.append('n', (data.n) ? data.n : '');
        params = params.append('branch_id', data.branch_id);
        params = params.append('category_id', id);
        params = params.append('query', (data.query) ? data.query : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/product-in-menu', {params});
    }

    getMenu(id: any, item: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('category_id', (item.category) ? item.category._id : '');
        params = params.append('query', (item.keyword) ? item.keyword : '');
        params = params.append('status', (item.status) ? item.status : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/menu/' + id, {params});
    }

    getProductInBranch(id: any, item: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('category_id', (item.category) ? item.category._id : '');
        params = params.append('query', (item.keyword) ? item.keyword : '');
        params = params.append('status', (item.status) ? item.status : '-1');
        params = params.append('p', (item.p) ? item.p : '');
        params = params.append('n', (item.n) ? item.n : '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/get-products-branch/' + id, {params});
    }

    setMenu(id: any, menu:any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/menu/' + id, menu);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/menu', menu);
        }
    }

    getComboItem(item: any) {
        let params = new HttpParams({encoder: this.customEncoder});
        params = params.append('status', (item.status) ? item.status : '-1');
        params = params.append('p', '');
        params = params.append('n', '');
        return this.httpClient.get<Data>(this.globals.API_DOMAIN + '/combos', {params});
    }

    updateComboItem(app: any, id: any) {
        if (id) {
            return this.httpClient.put<Data>(this.globals.API_DOMAIN + '/combo/' + id, app);
        } else {
            return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/combo', app);
        }
    }

    importItem(data: any) {
        return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/import-products', data);
    }

    updateManyItem(data: any) {
        return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/update-products', data);
    }

    updateItemBranch(branchId: any, data: any) {
        return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/update-product-branch/' + branchId, data);
    }

    updateManyItemBranch(branchId: any, data: any) {
        return this.httpClient.post<Data>(this.globals.API_DOMAIN + '/update-products-branch/' + branchId, data);
    }
}
