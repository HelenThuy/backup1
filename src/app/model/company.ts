import {Role} from './role';
import {Bank} from './bank';

export class Company {
	address: string;
	company_code: string;
	company_id: number;
	company_name: string;
	lat: number;
	long: number;
	phone_number: string;
	role_id: number;
	roles: Role;
	banks: Bank[];
}
