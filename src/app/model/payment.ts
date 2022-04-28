import {Bank} from './bank';

export class Payment {
    object_ids: string[];
    bank: Bank;
    callback_url?: any;
}
