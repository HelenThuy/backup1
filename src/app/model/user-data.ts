import {UserInfoCompany} from './user-info-company';

export class UserData {
	user_name: string;
	password: string;
	access_token: string;
	user_fullname: string;
	user_signature: string;
	birthday: number;
	sex: number;
	description: string;
	email: string;
	phone_number: string;
	rate: number;
	_id: string | number | any;
	user_info_at_company: UserInfoCompany[];
}
