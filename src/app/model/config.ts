import {AdsCampaign} from './config/ads-campaign';
import {ApiConfig} from './config/api-config';

export class Config {
	ads_campaign: AdsCampaign;
	app_version: string;
	pharmas: ApiConfig;
	phone_emergency: string;
	service: any;
	service_icd: ApiConfig;
}
