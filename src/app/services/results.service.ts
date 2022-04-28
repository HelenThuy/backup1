import {Injectable} from '@angular/core';
import {Results} from '../model/results';

@Injectable()
export class ResultsService {

	constructor(public results: Results) {
	}

	toResults(value: any): Results {
		this.results = {
			results: value
		};
		return this.results;
	}
}
