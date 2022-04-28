import {Results} from './results';

export class Data extends Results {
	status: boolean;
	_id: any;
	total: number;
	patient_id: number;
	count: number;
    errors?: any;
}
