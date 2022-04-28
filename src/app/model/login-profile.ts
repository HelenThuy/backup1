import {Company} from './company';
import {UserInfoCompany} from './user-info-company';
import {Role} from './role';
import {Services} from './services';

export class LoginProfile {
	companies: Company[];
	roles: Role[];
	services: Services[];
	user_info: any;
	user_info_company: UserInfoCompany[];
}
